from PIL import Image,ImageDraw,ImageFilter
from pathlib import Path
import numpy as np,json
alpha=np.asarray(Image.open('public/neymar-brasil-2016-penalti.png').getchannel('A'))
regions={
'right':([(640,1075),(720,1057),(752,1036),(801,1035),(860,1055),(920,1060),(970,1165),(615,1190)],(600,1010,990,1220)),
'left':([(245,1400),(340,1393),(371,1404),(412,1382),(445,1397),(510,1410),(565,1535),(235,1535)],(230,1345,590,1536)),
'head':([(340,0),(630,0),(630,180),(576,180),(568,200),(558,219),(544,237),(527,252),(514,271),(497,286),(480,302),(468,308),(452,304),(435,293),(419,278),(405,260),(393,241),(385,222),(379,199),(379,175),(340,175)],(325,0,655,350))
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
Path('public/regions-brasil-penalti.json').write_text(json.dumps(out),encoding='utf-8')
