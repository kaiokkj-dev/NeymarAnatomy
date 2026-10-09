"""Read public ESPN match commentary; keep only short evidence for goal classifications."""
import concurrent.futures,json,re,sys,urllib.request
from pathlib import Path
from bs4 import BeautifulSoup

ROOT=Path(__file__).resolve().parents[1]
records=json.loads((ROOT/'database/catalog-goals.json').read_text(encoding='utf8'))['records']
pending=[r for r in records if r['team']=='Barcelona' and ('--all' in sys.argv or r['body_part']=='unknown')]
def fetch(url):
 return urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=30).read().decode('utf8')
def season(item):
 year,url=item
 path=ROOT/f'work/espn-results-{year}{"-all" if year==2016 else ""}.html'
 html=path.read_text(encoding='utf8') if path.exists() else fetch(url)
 path.write_text(html,encoding='utf8')
 soup=BeautifulSoup(html,'html.parser');out={}
 for tr in soup.select('tr'):
  date=tr.select_one('[data-testid="date"]');link=tr.find('a',href=re.compile('/soccer/match/_/gameId/'))
  if not date or not link:continue
  m=re.search(r'([A-Z][a-z]{2}) (\d+)',date.text)
  if not m:continue
  month=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].index(m[1])+1
  key=f'{year if month>=7 else year+1}-{month:02d}-{int(m[2]):02d}'
  out[key]=re.search(r'gameId/(\d+)',link['href'])[1]
 return out
sources=[(2013,'https://www.espn.com/soccer/team/results/_/id/83/season/2013'),(2014,'https://www.espn.com/soccer/team/results/_/id/83/season/2014'),(2015,'https://www.espn.com/soccer/team/results/_/id/83/season/2015'),(2016,'https://www.espn.com/soccer/team/results/_/id/83/season/2016')]
matches={}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
 for result in pool.map(season,sources):matches.update(result)
manual=ROOT/'work/espn-extra-matches.json'
if manual.exists():matches.update(json.loads(manual.read_text(encoding='utf8')))
def walk(o):
 if isinstance(o,dict):
  if o.get('scoringPlay') and o.get('athlete',{}).get('name')=='Neymar':yield o
  for v in o.values():yield from walk(v)
 elif isinstance(o,list):
  for v in o:yield from walk(v)
def commentary(date):
 if date not in matches:return {'date':date,'error':'Match not found in season index'}
 gid=matches[date];url=f'https://www.espn.com/soccer/commentary/_/gameId/{gid}'
 path=ROOT/f'work/espn-commentary-{gid}.html'
 try:
  html=path.read_text(encoding='utf8') if path.exists() else fetch(url)
  path.write_text(html,encoding='utf8')
  soup=BeautifulSoup(html,'html.parser');script=next(s.text for s in soup.find_all('script') if "window['__espnfitt__']=" in s.text)
  data=json.JSONDecoder().raw_decode(script.split("window['__espnfitt__']=",1)[1])[0]
  events={}
  for e in walk(data):
   text=e.get('text','');body='right' if 'right footed' in text else 'left' if 'left footed' in text else 'head' if 'header' in text else None
   if body:events[e['id']]={'event_id':e['id'],'minute':e.get('timeLabel'),'score':f"{e.get('hmScr')}:{e.get('awScr')}",'body_part':body,'evidence':{'right':'right footed shot','left':'left footed shot','head':'header'}[body]}
  return {'date':date,'source_url':url,'events':list(events.values())}
 except Exception as e:return {'date':date,'error':type(e).__name__}
dates=sorted(set(r['date'] for r in pending))
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
 results=list(pool.map(commentary,dates))
for result in results:print(json.dumps(result,ensure_ascii=True))
(ROOT/'work/barcelona-commentary-evidence.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf8')
