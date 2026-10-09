import json
from pathlib import Path
r=json.loads(Path('public/regions-barcelona.json').read_text())
era={'Barcelona':{'image':'neymar-barcelona-2015.png','width':1024,'height':1536,'number':'11','alt':'Neymar com a camisa do Barcelona em uma comemoração de 2015, recorte preparado por IA a partir de fotografia','title':'BARCELONA · BERLIM, 2015','context':'A fase da tríplice coroa. Recorte preparado a partir de uma foto da final da Champions.','regions':r,'detailBounds':{'head':[415,15,250,285],'right':[275,1190,175,315],'left':[550,1190,285,320]},'source':'https://bleacherreport.com/articles/2489257-champions-league-201415-best-xi-of-tournament','originalImage':'https://legacymedia.sportsplatform.io/img/slides/photos/003/988/725/0b1ae9514a1e09ccdc0ec47940eeb038_crop_exact.jpg?h=2000&q=85&w=3800','historicalSource':'https://www.fcbarcelona.com/en/news/1074271/an-amazing-2015-for-fc-barcelona'}}
Path('public/eras.json').write_text(json.dumps(era,ensure_ascii=False),encoding='utf-8')
