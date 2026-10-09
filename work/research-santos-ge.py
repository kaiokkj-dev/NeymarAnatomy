import json,urllib.request,concurrent.futures,re
from pathlib import Path
from bs4 import BeautifulSoup
root=Path('.');records=json.loads((root/'database/catalog-goals.json').read_text(encoding='utf8'))['records'];games={x['match_id']:x for x in records if x['team']=='Santos' and x['body_part']=='unknown'};perf={str(x['gameInformation']['gameId']):x for x in json.load(open('work/neymar-tm-performance.json'))['data']['performance']}
def slug(name):
 for a,b in [('Internacional','internacional'),('Rio Branco','rio-branco'),('Santo Andr','santo-andre'),('Palmeiras','palmeiras'),('Grêmio Barueri','barueri'),('Oeste','oeste'),('São Paulo','sao-paulo'),('Naviraiense','naviraiense'),('Remo','remo'),('São Caetano','sao-caetano'),('Guarani','guarani'),('Mineiro','atletico-mg'),('Ceará','ceara'),('Grêmio Foot','gremio'),('Corinthians','corinthians'),('Goiás','goias'),('Once Caldas','once-caldas'),('Bahia','bahia'),('Botafogo FC','botafogo-sp'),('Botafogo de','botafogo'),('Flamengo','flamengo'),('Paranaense','atletico-pr'),('Vasco','vasco'),('Ponte Preta','ponte-preta'),('Juan Aurich','juan-aurich'),('Guaratinguet','guaratingueta'),('Catanduvense','catanduvense'),('Strongest','the-strongest'),('Bolívar','bolivar'),('Figueirense','figueirense'),('Coritiba','coritiba'),('São Bernardo','sao-bernardo'),('Bragantino','bragantino'),('Paulista FC','paulista'),('União Barbarense','uniao-barbarense')]:
  if a in name:return b
 return None
def fetch(x):
 date=x['date'];year=date[:4];opp=slug(x['opponent']);c=x['competition'];venue=perf.get(x['match_id'],{}).get('clubsInformation',{}).get('club',{}).get('venue','home');teams='santos-'+opp if venue=='home' else opp+'-santos';iso=date;dm='-'.join(reversed(date.split('-')))
 league='paulista'+year if 'Paulista' in c else 'brasileirao'+year if 'Brasileiro' in c else 'copa-do-brasil'+year if 'Copa do Brasil' in c else 'libertadores-'+year
 patterns=[(league,dm if year=='2011' else iso)] if year<'2012' else [(('paulista-2012' if year=='2012' else 'campeonato-paulista-2013') if 'Paulista' in c else 'brasileirao'+year if 'Brasileiro' in c else 'copa-do-brasil-'+year if 'Copa do Brasil' in c else 'libertadores-'+year,dm)]
 out=[]
 for league,dt in patterns:
  url=f'https://ge.globo.com/jogo/{league}/{dt}/{teams}.html';path=root/f'work/ge-santos-{date}-{opp}.html'
  try:
   html=path.read_text(encoding='utf8') if path.exists() else urllib.request.urlopen(url,timeout=20).read().decode('utf8');path.write_text(html,encoding='utf8');s=BeautifulSoup(html,'html.parser');body=s.select_one('#materia-letra') or s
   paragraphs=[]
   for p in body.select('p'):
    t=p.get_text(' ',strip=True)
    if re.search(r'(?:p[eé] |de (?:direita|esquerda)|cabe[cç](?:a|e)|peito)',t,re.I) and 'Neymar' in t:paragraphs.append(t)
   out.append({'date':date,'opponent':x['opponent'],'url':url,'paragraphs':paragraphs})
  except Exception as ex:out.append({'date':date,'url':url,'error':type(ex).__name__})
 return out
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
 out=[v for row in pool.map(fetch,games.values()) for v in row]
(root/'work/santos-ge-evidence.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf8')
print('pages',len(out),'successful',len([x for x in out if 'error' not in x]))
for x in out:
 if x.get('paragraphs'):print(json.dumps(x,ensure_ascii=True))
