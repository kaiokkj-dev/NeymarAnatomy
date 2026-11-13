// "Ajude a classificar": votos da comunidade para gols sem parte do corpo identificada.
// Os votos nunca alteram goals.body_part. O consenso fica separado, para conferência com fonte.
import express from "express";
import { createHmac, randomBytes } from "node:crypto";

export const PARTS = ["right", "left", "head"];
export const MIN_VOTES = 3; // votos mínimos para haver consenso
export const MIN_SHARE = 0.7; // parcela mínima da opção mais votada
export const VOTES_PER_HOUR = 30; // limite por endereço de rede
const COOKIE = "na_voter";

// Regra de consenso: pura, testável e usada pelos dois armazenamentos.
export function tally(rows) {
  const votes = { right: 0, left: 0, head: 0 };
  for (const row of rows) if (row.body_part in votes) votes[row.body_part] += Number(row.count ?? 1);
  const total = votes.right + votes.left + votes.head;
  const leader = total ? PARTS.reduce((a, b) => (votes[b] > votes[a] ? b : a)) : null;
  const tie = leader && PARTS.filter((p) => votes[p] === votes[leader]).length > 1;
  const consensus = !tie && total >= MIN_VOTES && votes[leader] / total >= MIN_SHARE;
  return {
    votes,
    total,
    leader: tie ? null : leader,
    status: consensus ? "consensus" : "open",
    missing: consensus ? 0 : Math.max(MIN_VOTES - total, 1),
  };
}

export function parseVote(body) {
  const part = body && typeof body.body_part === "string" ? body.body_part : null;
  return PARTS.includes(part) ? part : null;
}

export function parseGoalId(value) {
  return /^[1-9]\d{0,15}$/.test(String(value)) ? Number(value) : null;
}

// Postgres (Neon). `query(text, params)` devolve as linhas.
export function postgresStore(query) {
  return {
    async stats() {
      const [row] = await query(
        `SELECT
           (SELECT count(*)::int FROM public.goals WHERE body_part = 'unknown') AS pending,
           (SELECT count(*)::int FROM public.goal_votes) AS votes`,
        [],
      );
      const consensus = (await this.consensus()).length;
      return { pending: row.pending, votes: row.votes, consensus };
    },
    // Próximo gol: pendente, ainda não votado por esta pessoa, sem consenso; prioriza os com menos votos.
    async next(voterHash, skip = []) {
      const rows = await query(
        `WITH counts AS (
           SELECT goal_id, body_part, count(*)::int AS n FROM public.goal_votes GROUP BY goal_id, body_part
         ), per_goal AS (
           SELECT goal_id, sum(n)::int AS total, max(n)::int AS top FROM counts GROUP BY goal_id
         )
         SELECT g.id, to_char(g.date, 'YYYY-MM-DD') AS date, g.team, g.opponent, g.competition, g.method, g.minute, g.title, g.highlight_url, g.source_url
           FROM public.goals g
           LEFT JOIN per_goal p ON p.goal_id = g.id
          WHERE g.body_part = 'unknown'
            AND NOT (g.id = ANY($2::bigint[]))
            AND NOT EXISTS (SELECT 1 FROM public.goal_votes mine WHERE mine.goal_id = g.id AND mine.voter_hash = $1)
            AND (coalesce(p.total, 0) < $3 OR p.top::float / p.total < $4)
          ORDER BY coalesce(p.total, 0), random()
          LIMIT 1`,
        [voterHash, skip, MIN_VOTES, MIN_SHARE],
      );
      return rows[0] || null;
    },
    async goal(id) {
      const [row] = await query(`SELECT id, body_part FROM public.goals WHERE id = $1`, [id]);
      return row || null;
    },
    async recentVotesFromIp(ipHash) {
      const [row] = await query(
        `SELECT count(*)::int AS count FROM public.goal_votes WHERE ip_hash = $1 AND created_at > now() - interval '1 hour'`,
        [ipHash],
      );
      return row.count;
    },
    // Devolve false quando esta pessoa já votou neste gol.
    async vote(goalId, part, voterHash, ipHash) {
      const rows = await query(
        `INSERT INTO public.goal_votes (goal_id, body_part, voter_hash, ip_hash)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (goal_id, voter_hash) DO NOTHING
         RETURNING id`,
        [goalId, part, voterHash, ipHash],
      );
      return rows.length > 0;
    },
    async tally(goalId) {
      return tally(
        await query(
          `SELECT body_part, count(*)::int AS count FROM public.goal_votes WHERE goal_id = $1 GROUP BY body_part`,
          [goalId],
        ),
      );
    },
    async consensus() {
      const rows = await query(
        `SELECT g.id, to_char(g.date, 'YYYY-MM-DD') AS date, g.team, g.opponent, g.title, v.body_part, count(*)::int AS count
           FROM public.goal_votes v JOIN public.goals g ON g.id = v.goal_id
          WHERE g.body_part = 'unknown'
          GROUP BY g.id, v.body_part
          ORDER BY g.id`,
        [],
      );
      return groupConsensus(rows);
    },
  };
}

function groupConsensus(rows) {
  const byGoal = new Map();
  for (const r of rows) {
    if (!byGoal.has(r.id)) byGoal.set(r.id, { goal: r, rows: [] });
    byGoal.get(r.id).rows.push(r);
  }
  return [...byGoal.values()]
    .map(({ goal, rows }) => ({
      id: goal.id,
      date: goal.date,
      team: goal.team,
      opponent: goal.opponent,
      title: goal.title,
      ...tally(rows),
    }))
    .filter((g) => g.status === "consensus");
}

// Memória: usada no modo demonstração e nos testes. Os votos somem ao reiniciar o servidor.
export function memoryStore(goals) {
  const votes = [];
  let seq = 0;
  const pending = () => goals.filter((g) => g.body_part === "unknown");
  const rowsFor = (id) => votes.filter((v) => v.goal_id === id);
  const store = {
    async stats() {
      return { pending: pending().length, votes: votes.length, consensus: (await store.consensus()).length };
    },
    async next(voterHash, skip = []) {
      const options = pending()
        .filter((g) => !skip.includes(g.id))
        .filter((g) => !votes.some((v) => v.goal_id === g.id && v.voter_hash === voterHash))
        .filter((g) => tally(rowsFor(g.id)).status !== "consensus")
        .sort((a, b) => rowsFor(a.id).length - rowsFor(b.id).length || a.id - b.id);
      return options[0] || null;
    },
    async goal(id) {
      return goals.find((g) => g.id === id) || null;
    },
    async recentVotesFromIp(ipHash) {
      const hourAgo = Date.now() - 3600_000;
      return votes.filter((v) => v.ip_hash === ipHash && v.created_at > hourAgo).length;
    },
    async vote(goalId, part, voterHash, ipHash) {
      if (votes.some((v) => v.goal_id === goalId && v.voter_hash === voterHash)) return false;
      votes.push({ id: ++seq, goal_id: goalId, body_part: part, voter_hash: voterHash, ip_hash: ipHash, created_at: Date.now() });
      return true;
    },
    async tally(goalId) {
      return tally(rowsFor(goalId));
    },
    async consensus() {
      const rows = votes.map((v) => ({ ...goals.find((g) => g.id === v.goal_id), body_part: v.body_part, count: 1 }));
      return groupConsensus(rows.filter((r) => r.id && pending().some((g) => g.id === r.id)));
    },
  };
  return store;
}

function readCookie(req, name) {
  for (const part of (req.headers.cookie || "").split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=");
  }
  return null;
}

function clientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  return (typeof forwarded === "string" && forwarded.split(",")[0].trim()) || req.socket.remoteAddress || "unknown";
}

// `getStore` devolve o armazenamento ou null quando a conferência não está disponível.
export function reviewRouter({ getStore, secret, secureCookie = false }) {
  const router = express.Router();
  router.use(express.json({ limit: "1kb" }));
  const hash = (value) => createHmac("sha256", secret).update(value).digest("hex");

  // Identidade anônima: um cookie aleatório; o banco guarda só o HMAC dele e do IP.
  router.use((req, res, next) => {
    let id = readCookie(req, COOKIE);
    if (!id || !/^[a-f0-9]{32}$/.test(id)) {
      id = randomBytes(16).toString("hex");
      res.cookie(COOKIE, id, { httpOnly: true, sameSite: "lax", secure: secureCookie, maxAge: 365 * 24 * 3600 * 1000, path: "/api/review" });
    }
    req.voterHash = hash(`voter:${id}`);
    req.ipHash = hash(`ip:${clientIp(req)}`);
    res.set("Cache-Control", "no-store");
    next();
  });

  const withStore = (handler) => async (req, res) => {
    const store = await getStore();
    if (!store) return res.status(503).json({ error: "A conferência coletiva não está disponível agora." });
    try {
      await handler(store, req, res);
    } catch (error) {
      console.error("review", error);
      res.status(502).json({ error: "Não foi possível falar com o banco. Tente de novo em instantes." });
    }
  };

  router.get(
    "/next",
    withStore(async (store, req, res) => {
      const skip = String(req.query.skip || "")
        .split(",")
        .map(parseGoalId)
        .filter(Boolean)
        .slice(0, 50);
      const [goal, stats] = await Promise.all([store.next(req.voterHash, skip), store.stats()]);
      res.json({ goal, stats });
    }),
  );

  router.post(
    "/:id/vote",
    withStore(async (store, req, res) => {
      const id = parseGoalId(req.params.id);
      const part = parseVote(req.body);
      if (!id || !part) return res.status(400).json({ error: "Escolha pé direito, pé esquerdo ou cabeça." });
      const goal = await store.goal(id);
      if (!goal) return res.status(404).json({ error: "Gol não encontrado." });
      if (goal.body_part !== "unknown")
        return res.status(409).json({ error: "Este gol já tem classificação com fonte.", code: "classified" });
      if ((await store.recentVotesFromIp(req.ipHash)) >= VOTES_PER_HOUR)
        return res.status(429).json({ error: "Muitos votos em pouco tempo. Volte daqui a pouco." });
      const saved = await store.vote(id, part, req.voterHash, req.ipHash);
      const result = await store.tally(id);
      if (!saved) return res.status(409).json({ error: "Você já votou neste gol.", code: "duplicate", result });
      res.status(201).json({ result, stats: await store.stats() });
    }),
  );

  // Lista pública dos gols com consenso, para conferir com fonte antes de mudar a base oficial.
  router.get(
    "/consensus",
    withStore(async (store, _req, res) => {
      res.json({ min_votes: MIN_VOTES, min_share: MIN_SHARE, goals: await store.consensus() });
    }),
  );

  return router;
}
