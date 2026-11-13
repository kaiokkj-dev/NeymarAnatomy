// Testes da conferência coletiva: regras, rotas HTTP e o SQL real num Postgres em memória (PGlite).
import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import express from "express";
import { PGlite } from "@electric-sql/pglite";
import {
  tally,
  parseVote,
  parseGoalId,
  memoryStore,
  postgresStore,
  reviewRouter,
  VOTES_PER_HOUR,
} from "../lib/review.js";

const goal = (id, body_part = "unknown") => ({
  id,
  date: "2012-03-07",
  team: "Santos",
  opponent: `Adversário ${id}`,
  competition: "Copa Libertadores",
  method: "Bola rolando",
  minute: 30 + (id % 50),
  title: `Gol ${id}`,
  highlight_url: null,
  source_url: null,
  body_part,
});

describe("regra de consenso", () => {
  test("sem votos fica aberto", () => {
    assert.deepEqual(tally([]), {
      votes: { right: 0, left: 0, head: 0 },
      total: 0,
      leader: null,
      status: "open",
      missing: 3,
    });
  });
  test("três votos iguais formam consenso", () => {
    const r = tally([{ body_part: "left", count: 3 }]);
    assert.equal(r.status, "consensus");
    assert.equal(r.leader, "left");
  });
  test("menos de 70% não forma consenso", () => {
    const r = tally([
      { body_part: "right", count: 2 },
      { body_part: "left", count: 1 },
    ]);
    assert.equal(r.status, "open");
  });
  test("empate não tem líder", () => {
    const r = tally([
      { body_part: "right", count: 2 },
      { body_part: "head", count: 2 },
    ]);
    assert.equal(r.leader, null);
    assert.equal(r.status, "open");
  });
  test("validação de entrada", () => {
    assert.equal(parseVote({ body_part: "head" }), "head");
    assert.equal(parseVote({ body_part: "other" }), null);
    assert.equal(parseVote(null), null);
    assert.equal(parseGoalId("42"), 42);
    assert.equal(parseGoalId("0"), null);
    assert.equal(parseGoalId("1;drop"), null);
  });
});

// Sobe um servidor de teste com o armazenamento dado e devolve um cliente com cookies próprios.
async function startServer(store) {
  const app = express();
  app.use("/api/review", reviewRouter({ getStore: async () => store, secret: "test-secret" }));
  const server = await new Promise((resolve) => {
    const s = app.listen(0, "127.0.0.1", () => resolve(s));
  });
  const base = `http://127.0.0.1:${server.address().port}/api/review`;
  const client = (ip = "10.0.0.1") => {
    let cookie = "";
    return async (path, options = {}) => {
      const response = await fetch(base + path, {
        ...options,
        headers: { "content-type": "application/json", "x-forwarded-for": ip, cookie, ...(options.headers || {}) },
      });
      const set = response.headers.get("set-cookie");
      if (set) cookie = set.split(";")[0];
      return { status: response.status, body: await response.json() };
    };
  };
  return { server, client };
}

function httpSuite(name, makeStore) {
  describe(`rotas HTTP · ${name}`, () => {
    let ctx;
    before(async () => {
      ctx = await startServer(await makeStore());
    });
    after(() => ctx.server.close());

    test("devolve um gol pendente e as estatísticas", async () => {
      const api = ctx.client();
      const { status, body } = await api("/next");
      assert.equal(status, 200);
      assert.ok(body.goal.id);
      assert.equal(body.stats.pending, 40);
    });

    test("voto válido, voto repetido e entradas inválidas", async () => {
      const api = ctx.client();
      const { body } = await api("/next");
      const id = body.goal.id;
      const ok = await api(`/${id}/vote`, { method: "POST", body: JSON.stringify({ body_part: "right" }) });
      assert.equal(ok.status, 201);
      assert.equal(ok.body.result.votes.right, 1);
      const again = await api(`/${id}/vote`, { method: "POST", body: JSON.stringify({ body_part: "left" }) });
      assert.equal(again.status, 409);
      assert.equal(again.body.code, "duplicate");
      const bad = await api(`/${id}/vote`, { method: "POST", body: JSON.stringify({ body_part: "other" }) });
      assert.equal(bad.status, 400);
      const missing = await api(`/999999/vote`, { method: "POST", body: JSON.stringify({ body_part: "head" }) });
      assert.equal(missing.status, 404);
      const classified = await api(`/1000/vote`, { method: "POST", body: JSON.stringify({ body_part: "head" }) });
      assert.equal(classified.status, 409);
      assert.equal(classified.body.code, "classified");
      // Quem já votou não recebe o mesmo gol de novo.
      const next = await api("/next");
      assert.notEqual(next.body.goal.id, id);
    });

    test("três pessoas concordando formam consenso", async () => {
      const target = 7;
      for (let i = 0; i < 3; i++) {
        const api = ctx.client(`10.0.1.${i}`);
        await api("/next");
        const r = await api(`/${target}/vote`, { method: "POST", body: JSON.stringify({ body_part: "left" }) });
        assert.equal(r.status, 201);
      }
      const { body } = await ctx.client("10.0.2.1")("/consensus");
      const found = body.goals.find((g) => g.id === target);
      assert.equal(found.leader, "left");
      assert.equal(found.status, "consensus");
    });

    test("limite de votos por hora por endereço", async () => {
      let last;
      for (let i = 0; i <= VOTES_PER_HOUR; i++) {
        const api = ctx.client("10.9.9.9"); // cookie novo a cada voto, mesmo IP
        last = await api(`/${(i % 40) + 1}/vote`, { method: "POST", body: JSON.stringify({ body_part: "head" }) });
      }
      assert.equal(last.status, 429);
    });
  });
}

const goals = [...Array.from({ length: 40 }, (_, i) => goal(i + 1)), goal(1000, "right")];

httpSuite("memória", () => memoryStore(goals.map((g) => ({ ...g }))));

httpSuite("Postgres (PGlite)", async () => {
  const db = new PGlite();
  const schema = await readFile(new URL("../database/schema.sql", import.meta.url), "utf8");
  await db.exec(schema);
  for (const g of goals)
    await db.query(
      `INSERT INTO public.goals (id, date, team, opponent, competition, body_part, method, minute, title)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [g.id, g.date, g.team, g.opponent, g.competition, g.body_part, g.method, g.minute, g.title],
    );
  return postgresStore(async (text, params) => (await db.query(text, params)).rows);
});
