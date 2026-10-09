import urllib.request,concurrent.futures,json,re
from bs4 import BeautifulSoup
from pathlib import Path
base='https://acervosantista.com.br/'
def fetch(u):return urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'}),timeout=25).read().decode('utf8')
links=set()
for n in range(1,12):
 try:
  s=BeautifulSoup(fetch(base+'tag/neymar/'+('page/'+str(n)+'/' if n>1 else '')),'html.parser')
  found={a['href'] for a in s.select('h2 a') if re.search(r'/\d{2}-\d{2}-20(?:09|10|11|12|13)-',a.get('href',''))}
  links.update(found)
 except:break
print('links',len(links),flush=True)
def read(u):
 try:
  html=fetch(u);path=Path('work/acervo-'+u.rstrip('/').split('/')[-1]+'.html');path.write_text(html,encoding='utf8');s=BeautifulSoup(html,'html.parser');ps=[]
  for p in s.select('p'):
   t=p.get_text(' ',strip=True)
   if re.search(r'(direit[oa]|esquerd[oa]|cabe[cç]|peito)',t,re.I) and re.search('Neymar',t,re.I):ps.append(t)
  return {'url':u,'paragraphs':ps}
 except:return {'url':u,'error':True}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:out=list(pool.map(read,sorted(links)))
Path('work/santos-acervo-evidence.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf8')
for x in out:
 if x.get('paragraphs'):print(json.dumps(x,ensure_ascii=True))
