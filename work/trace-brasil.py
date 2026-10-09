from PIL import Image,ImageDraw,ImageFilter
from pathlib import Path
import numpy as np,json
alpha=np.asarray(Image.open('public/neymar-brasil-2016.png').getchannel('A'))
regions={
'right':([(800,1000),(1000,1000),(1000,730),(850,730),(850,846),(866,850),(879,877),(886,900),(889,920),(882,938),(865,950),(845,951),(800,945)],(795,725,1005,1005)),
'left':([(475,1495),(815,1495),(815,1330),(596,1330),(596,1355),(580,1370),(565,1380),(551,1385),(532,1390),(503,1390),(475,1385)],(470,1320,820,1500)),
'head':([(430,160),(700,160),(700,465),(550,465),(531,429),(510,413),(498,401),(486,389),(470,367),(456,345),(452,320),(447,299),(430,299)],(425,155,705,470))
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
Path('public/regions-brasil.json').write_text(json.dumps(out),encoding='utf-8')
