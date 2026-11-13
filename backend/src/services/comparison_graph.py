"""Validate the complete declared vertex set, including isolated concepts."""
import numpy as np

def prepare_graph(concepts,pairs):
    if not 2<=len(concepts)<=30:raise ValueError('作品数须为2–30项')
    ordered=sorted(concepts,key=lambda x:x['code'])
    ids=[x['id'] for x in ordered]
    if len(set(ids))!=len(ids) or len({x['code'] for x in ordered})!=len(ids):raise ValueError('作品标识重复')
    index={v:i for i,v in enumerate(ids)};adj=[set() for _ in ids];edges=[];seen=set()
    if not pairs or len(pairs)>300:raise ValueError('比较图无票，或超过300条边资源上限')
    for p in pairs:
        a,b=p['left_id'],p['right_id'];w,l=p['left_wins'],p['right_wins']
        if a not in index or b not in index:raise ValueError('比较边引用了研究之外的作品')
        if a==b:raise ValueError('不允许作品自比进入模型')
        if any(isinstance(x,bool) or not isinstance(x,int) or x<0 or x>1000 for x in (w,l)):raise ValueError('票数须为0–1000的整数')
        if w+l==0:raise ValueError('比较边无有效票')
        i,j=index[a],index[b]
        if i>j:i,j,w,l=j,i,l,w
        if (i,j) in seen:raise ValueError('重复的无向比较边，请先汇总票数')
        seen.add((i,j));adj[i].add(j);adj[j].add(i);edges.append({'i':i,'j':j,'wins':w,'total':w+l})
    reached={0};todo=[0]
    while todo:
        for j in adj[todo.pop()]-reached:reached.add(j);todo.append(j)
    if len(reached)!=len(ids):raise ValueError('正票比较图断连：不能跨不相连作品给出共同排名')
    edges.sort(key=lambda e:(e['i'],e['j']))
    return ordered,edges,{'vertices':len(ids),'edges':len(edges),'votes':sum(e['total'] for e in edges),'connected':True,'degree':[len(a) for a in adj]}
