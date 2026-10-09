import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";
const root = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.get("/api/career-reference", async (_req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.json({ records: [] });
    const sql = neon(process.env.DATABASE_URL);
    const records =
      await sql`SELECT team, scope, period, goals, matches, assists, assists_source_url, assists_period,
      to_char(as_of, 'YYYY-MM-DD') AS as_of, complete_period, source_url
      FROM public.career_reference ORDER BY as_of DESC, team`;
    res.json({ records });
  } catch {
    res
      .status(502)
      .json({ error: "Não foi possível carregar as referências da carreira." });
  }
});
// A chave do banco fica apenas no servidor; nunca é enviada ao navegador.
app.get("/api/goals", async (_req, res) => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVER_KEY;
  if (Boolean(url) !== Boolean(key))
    return res
      .status(503)
      .json({ error: "Configure URL e chave do Supabase juntas." });
  try {
    if (process.env.DATABASE_URL) {
      const sql = neon(process.env.DATABASE_URL);
      const goals =
        await sql`SELECT id, to_char(date, 'YYYY-MM-DD') AS date, team, opponent, competition, body_part, method, minute, title, highlight_url, source_url FROM public.goals ORDER BY date DESC, id DESC LIMIT 5000`;
      return res.json({ mode: "database", provider: "Neon", goals });
    }
    if (url && key) {
      const endpoint = new URL("/rest/v1/goals", url);
      endpoint.searchParams.set("select", "*");
      endpoint.searchParams.set("order", "date.desc");
      endpoint.searchParams.set("limit", "5000");
      const response = await fetch(endpoint, {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw new Error("Falha no banco");
      return res.json({ mode: "database", goals: await response.json() });
    }
    const goals = JSON.parse(
      await readFile(path.join(root, "demo-goals.json"), "utf8"),
    );
    res.json({ mode: "demo", goals });
  } catch {
    res
      .status(502)
      .json({
        error:
          "Não foi possível carregar os gols. Verifique a conexão e a configuração do banco.",
      });
  }
});
app.use(express.static(path.join(root, "public")));
app.listen(process.env.PORT || 3000, "127.0.0.1", () =>
  console.log(`Neymar Anatomy: http://localhost:${process.env.PORT || 3000}`),
);
