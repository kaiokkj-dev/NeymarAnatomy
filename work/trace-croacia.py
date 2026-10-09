from PIL import Image,ImageDraw,ImageFilter
from pathlib import Path
import numpy as np,json
alpha=np.asarray(Image.open('public/neymar-croacia-2022.png').getchannel('A'))
regions={
'right':([(65,1080),(310,1080),(310,1140),(248,1140),(234,1150),(221,1175),(230,1205),(245,1230),(310,1230),(310,1340),(65,1340)],(60,1070,315,1350)),
'left':([(400,1007),(455,1007),(467,985),(475,982),(503,1000),(532,1012),(552,1025),(549,1060),(549,1100),(560,1140),(570,1160),(562,1165),(550,1165),(520,1155),(490,1130),(470,1105),(435,1080),(410,1080)],(400,950,585,1190)),
'head':([(360,130),(630,130),(630,325),(565,325),(566,344),(561,355),(550,362),(536,368),(522,368),(507,363),(487,354),(469,343),(454,330),(441,314),(425,309),(409,309),(360,309)],(350,120,640,425))
}

def simplify(points,eps):
 if len(points)<3:return points
 a=np.array(points[0],float);b=np.array(points[-1],float);v=b-a
 distances=[np.linalg.norm(np.array(p)-a) if np.linalg.norm(v)==0 else abs(v[0]*(p[1]-a[1])-v[1]*(p[0]-a[0]))/np.linalg.norm(v) for p in points]
 i=int(np.argmax(distances))
 if distances[i]>eps:return simplify(points[:i+1],eps)[:-1]+simplify(points[i:],eps)
 return [points[0],points[-1]]
out={}
for name,(polygon,bounds) in regions.items():
 clip=Image.new('L',(1024,1536));ImageDraw.Draw(clip).polygon(polygon,fill=255)
 mask=(alpha>=128)&(np.asarray(clip)>0)
 mask=np.asarray(Image.fromarray(mask.astype('uint8')*255).filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3)))>0
 x0,y0,x1,y1=bounds;edges={}
 def add(a,b):edges.setdefault(a,[]).append(b)
 for y in range(y0,y1):
  for x in range(x0,x1):
   if not mask[y,x]:continue
   if y==0 or not mask[y-1,x]:add((x,y),(x+1,y))
   if not mask[y,x+1]:add((x+1,y),(x+1,y+1))
   if y==1535 or not mask[y+1,x]:add((x+1,y+1),(x,y+1))
   if not mask[y,x-1]:add((x,y+1),(x,y))
 loops=[]
 while edges:
  start=next(iter(edges));p=start;loop=[];prev=None
  while p in edges:
   loop.append(p)
   choices=edges[p]
   if prev is not None and len(choices)>1:
    vx,vy=p[0]-prev[0],p[1]-prev[1]
    def turn(q):
     wx,wy=q[0]-p[0],q[1]-p[1]
     cross=vx*wy-vy*wx;dot=vx*wx+vy*wy
     return 3 if cross>0 else 2 if dot>0 else 1 if cross<0 else 0
    q=max(choices,key=turn)
   else:q=choices[0]
   choices.remove(q)
   if not choices:del edges[p]
   prev,p=p,q
   if p==start:break
  if p==start:loops.append(loop)
 def area(loop):return abs(sum(x*loop[(i+1)%len(loop)][1]-y*loop[(i+1)%len(loop)][0] for i,(x,y) in enumerate(loop)))
 points=max(loops,key=area);middle=len(points)//2
 points=simplify(points[:middle+1],.65)[:-1]+simplify(points[middle:]+[points[0]],.65)
 d='M '+' L '.join(f'{x},{y}' for x,y in points)+' Z'
 out[name]={'d':d,'bounds':bounds,'points':len(points)}
 print(name,len(points))
Path('public/regions-croacia.json').write_text(json.dumps(out),encoding='utf-8')
