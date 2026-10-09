import {neon} from '@neondatabase/serverless';
import {readFile} from 'node:fs/promises';

try {
 const {records}=JSON.parse(await readFile('database/catalog-goals.json','utf8'));
 if(new Set(records.map(r=>r.source_event_id)).size!==records.length)throw new Error('Eventos duplicados');
 const sql=neon(process.env.DATABASE_URL);
 await sql`ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS source_event_id text UNIQUE`;
 // A identificação inclui partida e placar do lance, preservando gols do mesmo minuto.
 const queries=records.map(r=>sql`INSERT INTO public.goals (source_event_id,date,team,opponent,competition,body_part,method,minute,title,source_url)
 VALUES (${r.source_event_id},${r.date},${r.team},${r.opponent},${r.competition},${r.body_part},${r.method},${r.minute},${r.title},${r.source_url})
 ON CONFLICT (source_event_id) DO UPDATE SET date=EXCLUDED.date,team=EXCLUDED.team,opponent=EXCLUDED.opponent,competition=EXCLUDED.competition,body_part=EXCLUDED.body_part,method=EXCLUDED.method,minute=EXCLUDED.minute,title=EXCLUDED.title,source_url=EXCLUDED.source_url`);
 await sql.transaction(queries);
 console.log(`${records.length} gols importados; ${records.filter(r=>r.body_part!=='unknown').length} com parte do corpo identificada.`);
}catch{console.error('Não foi possível importar o catálogo de gols.');process.exitCode=1;}
