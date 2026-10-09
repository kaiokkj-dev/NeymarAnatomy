from pathlib import Path
p=Path('work/trace-barcelona.py');s=p.read_text()
s=s.replace('def add(a,b):edges[a]=b','def add(a,b):edges.setdefault(a,[]).append(b)')
a=s.index(' while edges:');b=s.index(' middle=',a) if ' middle=' in s[a:] else -1
end=s.index(" d='M '",a)
s=s[:a]+''' while edges:
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
''' +s[end:]
p.write_text(s)
