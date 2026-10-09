from pathlib import Path
import json
s=Path('work/trace-barcelona.py').read_text(encoding='utf-8')
s=s.replace('public/neymar-barcelona-2015.png','public/neymar-brasil-2016.png').replace('public/regions-barcelona.json','public/regions-brasil.json')
a=s.index('regions={');b=s.index('\ndef simplify',a)
s=s[:a]+'''regions={
'right':([(800,1000),(1000,1000),(1000,730),(850,730),(850,846),(866,850),(879,877),(886,900),(889,920),(882,938),(865,950),(845,951),(800,945)],(795,725,1005,1005)),
'left':([(475,1495),(815,1495),(815,1330),(596,1330),(596,1355),(580,1370),(565,1380),(551,1385),(532,1390),(503,1390),(475,1385)],(470,1320,820,1500)),
'head':([(430,160),(700,160),(700,465),(550,465),(531,429),(510,413),(498,401),(486,389),(470,367),(456,345),(452,320),(447,299),(430,299)],(425,155,705,470))
}
''' +s[b:]
Path('work/trace-brasil.py').write_text(s,encoding='utf-8')
