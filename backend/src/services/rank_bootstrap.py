"""Conditional count bootstrap: fixed n_ij, empirical p_ij, not a posterior."""
from collections import Counter
from pathlib import Path
import hashlib,json
import numpy as np
from scipy.special import expit
from src.services.comparison_graph import prepare_graph
from src.services.bt_solver import fit_bt,average_ranks

def analyze_ranking(snapshot,ridge,repeats,seed,heartbeat=None):
    if not isinstance(repeats,int) or not 50<=repeats<=200:raise ValueError('bootstrap重复须为50–200')
    concepts,edges,graph=prepare_graph(snapshot['concepts'],snapshot['pairs']);n=len(concepts)
    theta,diagnostic=fit_bt(n,edges,ridge);rank,_=average_ranks(theta)
    rng=np.random.default_rng(seed);draws=[];ranks=[];shares=[]
    totals=np.array([e['total'] for e in edges]);observed=np.array([e['wins']/e['total'] for e in edges])
    for b in range(repeats):
        wins=rng.binomial(totals,observed)
        resampled=[{**e,'wins':int(w)} for e,w in zip(edges,wins)]
        values,diag=fit_bt(n,resampled,ridge);r,s=average_ranks(values);ranks.append(r);shares.append(s)
        draws.append({'repeat':b+1,'wins':wins.tolist(),'abilities':values.tolist(),'ranks':r.tolist(),'first_share':s.tolist(),'gradient_max':diag['gradient_max']})
        if heartbeat:heartbeat()
    rr=np.asarray(ranks);ss=np.asarray(shares)
    rows=[]
    for i,c in enumerate(concepts):
        q=np.quantile(rr[:,i],[.025,.5,.975]);freq=Counter(str(float(x)) for x in rr[:,i])
        rows.append({**c,'ability':float(theta[i]),'rank':float(rank[i]),'rank_low':float(q[0]),'rank_median':float(q[1]),'rank_high':float(q[2]),'first_share':float(ss[:,i].mean()),'rank_frequency':dict(sorted(freq.items(),key=lambda x:float(x[0]))),'comparisons':graph['degree'][i]})
    matrix=[[None if i==j else float(expit(theta[i]-theta[j])) for j in range(n)] for i in range(n)]
    canonical={'version':'centered-ridge-bt-empirical-binomial-v1','snapshot':snapshot,'ridge':ridge,'repeats':repeats,'seed':seed}
    fingerprint=hashlib.sha256(json.dumps(canonical,sort_keys=True,separators=(',',':'),allow_nan=False).encode()).hexdigest()
    return {'concepts':rows,'probabilities':matrix,'graph':graph,'diagnostic':diagnostic,'ridge':ridge,'repeats':repeats,'seed':seed,'draws':draws,'edge_totals':totals.tolist(),'edge_order':edges,'fingerprint':fingerprint,'snapshot':snapshot,'tie_rule':'average rank for abilities within 1e-8; first share split equally among tied first','interval':'2.5%/97.5% empirical rank quantiles, linearly interpolated; not posterior or simultaneous confidence limits','resampling':'independent Binomial(n_ij, observed wins_ij/n_ij), fixed pair totals'}
