import { neon } from '@neondatabase/serverless';
import { readFile } from 'node:fs/promises';
try {
  const sql = neon(process.env.DATABASE_URL);
  const data = JSON.parse(await readFile('database/career-reference.json', 'utf8'));
  await sql`CREATE TABLE IF NOT EXISTS public.career_reference (
    team text NOT NULL, scope text NOT NULL, period text NOT NULL,
    goals integer NOT NULL CHECK (goals >= 0), matches integer,
    as_of date NOT NULL, complete_period boolean NOT NULL,
    source_url text NOT NULL, researched_on date NOT NULL,
    PRIMARY KEY (team, scope, as_of)
  )`;
  for (const r of data.records) {
    await sql`INSERT INTO public.career_reference
      (team, scope, period, goals, matches, as_of, complete_period, source_url, researched_on)
      VALUES (${r.team}, ${r.scope}, ${r.period}, ${r.goals}, ${r.matches}, ${r.as_of}, ${r.complete_period}, ${r.source_url}, ${data.researched_on})
      ON CONFLICT (team, scope, as_of) DO UPDATE SET
        goals=EXCLUDED.goals, matches=EXCLUDED.matches, period=EXCLUDED.period,
        source_url=EXCLUDED.source_url, complete_period=EXCLUDED.complete_period,
        researched_on=EXCLUDED.researched_on`;
  }
  console.log(JSON.stringify({imported:data.records.length, table:'career_reference'}));
} catch (error) {
  console.error(JSON.stringify({error:'Falha ao importar referências',code:error.code || 'connection_failed'}));
  process.exitCode=1;
}
