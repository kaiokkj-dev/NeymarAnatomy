from pathlib import Path
s=Path('work/trace-contours.py').read_text(encoding='utf-8')
s=s.replace("public/neymar.png","public/neymar-barcelona-2015.png")
a=s.index('regions={');b=s.index('\ndef simplify',a)
s=s[:a]+'''regions={
'right':([(280,1530),(440,1530),(440,1260),(394,1260),(384,1274),(362,1279),(346,1275),(330,1266),(325,1220),(280,1220)],(275,1200,445,1505)),
'left':([(560,1530),(820,1530),(820,1290),(715,1290),(695,1275),(674,1270),(654,1265),(639,1250),(635,1230),(610,1225),(560,1225)],(555,1200,825,1505)),
'head':([(420,10),(650,10),(650,245),(615,245),(603,258),(589,265),(575,269),(559,269),(541,261),(516,243),(498,228),(480,228),(420,228)],(415,5,655,290))
}
''' +s[b:]
s=s.replace("public/regions.json","public/regions-barcelona.json")
Path('work/trace-barcelona.py').write_text(s,encoding='utf-8')
