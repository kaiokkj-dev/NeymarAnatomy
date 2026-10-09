import { neon } from '@neondatabase/serverless';
import { readFile } from 'node:fs/promises';
try {
 if(!process.env.DATABASE_URL) throw new Error('missing');
 const sql=neon(process.env.DATABASE_URL);
 const schema=await readFile('database/schema.sql','utf8');
 for(const statement of schema.split(';').map(s=>s.trim()).filter(Boolean)) {
  if(statement.replace(/--[^\n]*/g,'').trim()) await sql.query(statement);
 }
 const result=await sql`SELECT count(*)::int AS count FROM public.goals`;
 console.log(JSON.stringify({connected:true,table:'goals',records:result[0].count}));
} catch(e) { console.log(JSON.stringify({connected:false,code:e.code||'connection_failed'})); process.exitCode=1; }
