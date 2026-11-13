"""Convex ridge Bradley–Terry objective on an explicit sum-zero basis."""
import numpy as np
from scipy.optimize import minimize
from scipy.special import expit
from scipy.linalg import null_space

def objective(theta,edges,ridge):
    i=np.array([e['i'] for e in edges]);j=np.array([e['j'] for e in edges]);n=np.array([e['total'] for e in edges],dtype=float);w=np.array([e['wins'] for e in edges],dtype=float)
    gap=theta[i]-theta[j];p=expit(gap)
    loss=float(np.sum(n*np.logaddexp(0.,gap)-w*gap)+ridge/2*np.dot(theta,theta))
    grad=ridge*theta.copy();res=n*p-w;np.add.at(grad,i,res);np.add.at(grad,j,-res)
    design=np.zeros((len(edges),len(theta)));design[np.arange(len(edges)),i]=1;design[np.arange(len(edges)),j]=-1
    hess=(design.T*(n*p*(1-p)))@design+ridge*np.eye(len(theta))
    return loss,grad,hess

def fit_bt(n,edges,ridge=1.):
    if not np.isfinite(ridge) or ridge<=0:raise ValueError('ridge必须固定为正有限值')
    q=null_space(np.ones((1,n)))
    def fun(z):
        loss,grad,_=objective(q@z,edges,ridge);return loss,q.T@grad
    def hess(z):return q.T@objective(q@z,edges,ridge)[2]@q
    fit=minimize(fun,np.zeros(n-1),jac=True,hess=hess,method='trust-exact',options={'gtol':1e-9,'maxiter':200})
    theta=q@fit.x;theta-=theta.mean();polish=0
    # Near the optimum, floating-point loss changes can be below the trust-region
    # ratio resolution. A full analytic Newton step refines the gradient itself.
    for _ in range(8):
        value,g,h=objective(theta,edges,ridge);projected=q.T@g
        if np.max(np.abs(projected))<=1e-10:break
        candidate=theta-q@np.linalg.solve(q.T@h@q,projected);candidate-=candidate.mean()
        cv,cg,_=objective(candidate,edges,ridge)
        if cv<=value+1e-12*max(1.,abs(value)) and np.max(np.abs(q.T@cg))<np.max(np.abs(projected)):
            theta=candidate;polish+=1
        else:break
    loss,grad,_=objective(theta,edges,ridge);gn=float(np.max(np.abs(q.T@grad)))
    # A trust-region precision status may occur near machine precision. Acceptance
    # still requires an independently recomputed analytic first-order residual.
    if not np.isfinite(theta).all() or not np.isfinite(loss) or gn>1e-6:raise ValueError(f'优化未达一阶条件，梯度={gn:.4g}')
    return theta,{'objective':loss,'gradient_max':gn,'iterations':int(fit.nit),'newton_polish_steps':polish,'optimizer_success':bool(fit.success),'optimizer_message':str(fit.message),'centering_sum':float(theta.sum()),'acceptance':'finite objective and projected gradient max <= 1e-6'}

def average_ranks(theta,tolerance=1e-8):
    order=np.argsort(-np.asarray(theta),kind='stable');rank=np.zeros(len(order));share=np.zeros(len(order));start=0
    while start<len(order):
        end=start+1
        while end<len(order) and theta[order[start]]-theta[order[end]]<=tolerance:end+=1
        rank[order[start:end]]=(start+1+end)/2
        if start==0:share[order[start:end]]=1/(end-start)
        start=end
    return rank,share
