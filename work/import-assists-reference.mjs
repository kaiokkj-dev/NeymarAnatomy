import {neon} from '@neondatabase/serverless';
import {readFile} from 'node:fs/promises';
try {
 const sql=neon(process.env.DATABASE_URL);
 await sql`ALTER TABLE public.career_reference ADD COLUMN IF NOT EXISTS assists integer CHECK (assists >= 0), ADD COLUMN IF NOT EXISTS assists_source_url text, ADD COLUMN IF NOT EXISTS assists_period text`;
 const data=JSON.parse(await readFile('database/assists-research.json','utf8'));
 for(const r of data.records){
  if(r.assists===null)continue;
  await sql`UPDATE public.career_reference SET assists=${r.assists}, assists_source_url=${r.source_url}, assists_period=${r.period} WHERE team=${r.team} AND as_of=(SELECT MAX(as_of) FROM public.career_reference WHERE team=${r.team})`;
 }
 console.log('Referências de assistências atualizadas.');
}catch{console.error('Não foi possível atualizar as assistências.');process.exitCode=1;}
