import {useEffect,useState} from 'react';
import {researchStore,loadRuns} from '../stores/research';
import {useTask} from '../hooks/useTask';import {usePolling} from '../hooks/usePolling';
import {num,percent} from '../utils/format';import PageHeading from '../components/common/PageHeading';
import ErrorNotice from '../components/common/ErrorNotice';import StatusBadge from '../components/common/StatusBadge';
import RunSelect from '../components/RunSelect';import RankPlot from '../components/RankPlot';
export default function Results(){
const {runs,selected}=researchStore.use(),{error,perform}=useTask(),[tab,setTab]=useState('ability'),[code,setCode]=useState(''),[page,setPage]=useState(0);
useEffect(()=>{perform(loadRuns)},[]);usePolling(loadRuns);useEffect(()=>{setPage(0);setCode('')},[selected]);
const run=runs.find(r=>r.id===selected),r=run?.status==='completed'?run.result:null;
const index=r?Math.max(0,r.concepts.findIndex(c=>c.code===code)):0,c=r?.concepts[index];
return <>
<PageHeading no="04" title="结果与重现" sub="能力依赖比较对手；一次名次，仍需放进反复重拟合的分布里阅读。"/>
<RunSelect/><ErrorNotice error={error}/>
{!run&&<div className="empty"><h2>还没有可阅读的研究。</h2><p>先到拟合工作台冻结一份票数并排队。</p><a href="#/runs">前往拟合工作台 →</a></div>}
{run&&!r&&<div className="empty"><StatusBadge status={run.status}/><h2>{run.name}</h2><p>{run.error||'研究仍在队列中。完成后结果会自动出现。'}</p><a href="#/runs">返回工作台核对 →</a></div>}
{r&&run&&<>
<div className="result-byline"><b>#{run.id}　{run.name}</b><span>λ {run.ridge} · seed {run.seed} · {run.repeats}次重拟合</span></div>
<div className="result-metrics"><div><small>正票比较图</small><b>{r.graph.vertices} / {r.graph.edges}</b><span>作品 / 比较边 · 连通</span></div><div><small>冻结票数</small><b>{r.graph.votes.toLocaleString()}</b><span>条件于每对固定总票</span></div><div><small>中心化能力总和</small><b>{num(r.diagnostic.centering_sum,8)}</b><span>可正可负，非绝对品质</span></div><div><small>投影梯度最大值</small><b>{r.diagnostic.gradient_max.toExponential(2)}</b><span>阈值 ≤ 1e−6</span></div></div>
<div className="result-tabs" role="tablist" aria-label="结果视图">{[['ability','能力与对手'],['stability','名次重现'],['archive','重复留档']].map(([id,label])=><button role="tab" aria-selected={tab===id} className={tab===id?'active':''} onClick={()=>setTab(id)} key={id}>{label}</button>)}</div>
{tab==='ability'&&<div className="result-spread"><section>
<h2 className="ruled-title">中心化能力 <small>θ · 正则MLE</small></h2>
<div className="ability-list">{[...r.concepts].sort((a,b)=>a.rank-b.rank).map(x=><button className={x.code===c?.code?'selected':''} key={x.id} onClick={()=>setCode(x.code)}><span className="ability-rank">{num(x.rank,Number.isInteger(x.rank)?0:1)}</span><span><b>{x.title}</b><small>{x.code} / 比较{x.comparisons}项对手</small></span><strong>{num(x.ability,4)}</strong></button>)}</div>
</section><section className="opponent-panel"><p className="eyebrow">OPPONENT-ADJUSTED PREFERENCE</p><h2>{c?.code} · {c?.title}</h2><p className="muted">选择左侧作品，查看其对每一个不同对手的模型胜出概率。自比不参与模型，也不显示为一项得分。</p><div className="opponent-list">{r.concepts.map((x,j)=>j===index?null:<div key={x.id}><span>{x.code} {x.title}</span><div className="prob-track"><i style={{width:percent(r.probabilities[index][j]!)}}/></div><b>{percent(r.probabilities[index][j]!)}</b></div>)}</div><aside className="margin-note"><b>一条能力刻度的含义</b><p>logistic(θᵢ − θⱼ)表示本研究成对选择模型中的偏好关联；能力总和固定为零，负值不表示作品没有价值。</p><p>模型不包含预算、可实施性或公共价值，也不自动给出立项决定。</p></aside></section>
</div>}
{tab==='stability'&&<div className="stability-spread"><section><h2 className="ruled-title">名次的重现范围 <small>{r.repeats}次真实重拟合</small></h2><div className="rank-chart-scroll"><RankPlot rows={r.concepts}/></div><p className="plot-caption"><i/>横线：2.5%–97.5%经验名次分位　<span>●</span>点：原始票数拟合名次</p><p className="muted">窄屏可横向查看完整名次刻度。分位数采用线性插值，可为小数；并列能力差≤1e−8时取平均名次，不按作品编号打破并列。此范围不是同时置信区间。</p></section><aside className="distribution-note"><p className="eyebrow">A CLOSER LISTEN / 观察一项</p><label>作品<select aria-label="名次分布作品" value={c?.code} onChange={e=>setCode(e.target.value)}>{r.concepts.map(x=><option key={x.id} value={x.code}>{x.code} {x.title}</option>)}</select></label><h2>{c?.title}</h2><p>首位分摊频率 <b>{percent(c?.first_share||0)}</b></p><p className="muted">每次重复的并列首位均分1份；这是重采样频率，不是“最优作品”的后验概率。</p><div className="frequency-bars">{Object.entries(c?.rank_frequency||{}).map(([rank,count])=><div key={rank}><span>第{rank}名</span><i style={{width:percent(count/r.repeats)}}/><b>{count}次</b></div>)}</div><div className="margin-note"><b>不确定性来自哪里</b><p>每对独立按观测胜率抽取Binomial票数，保持总票数固定。未覆盖评审人相关、题序偏差、作品集合变化。</p><p>同一评审人的多次选择若相关，成对iid假设可能失效；本数据只保留匿名汇总计数。</p></div></aside></div>}
{tab==='archive'&&<section><h2 className="ruled-title">每一次重拟合，原样留档 <small>{r.draws.length} / {r.repeats}</small></h2><p>下表展示全部重复的能力与平均名次；每页20次。展开任一行可查看该次每条边的实际左胜票数，边序与固定总票数一并保留。</p><div className="table-scroll"><table className="draw-table"><thead><tr><th>重复 / 梯度</th>{r.concepts.map(x=><th key={x.id}>{x.code}<small>能力 / 名次</small></th>)}</tr></thead><tbody>{r.draws.slice(page*20,(page+1)*20).map(d=><tr key={d.repeat}><td><details><summary>#{d.repeat}</summary><pre>{JSON.stringify({wins:d.wins,edge_totals:r.edge_totals,edge_order:r.edge_order},null,2)}</pre></details><small>{d.gradient_max.toExponential(1)}</small></td>{d.abilities.map((a,j)=><td key={j}>{num(a,4)}<small>第{d.ranks[j]}名</small></td>)}</tr>)}</tbody></table></div><div className="button-row"><button disabled={page===0} onClick={()=>setPage(page-1)}>上一页</button><span>{page+1} / {Math.ceil(r.draws.length/20)}</span><button disabled={(page+1)*20>=r.draws.length} onClick={()=>setPage(page+1)}>下一页</button></div><details className="edit-fold"><summary>目标函数与求解记录</summary><p>Σ[nᵢⱼ logaddexp(0,θᵢ−θⱼ) − wᵢⱼ(θᵢ−θⱼ)] + λ/2 Σθᵢ²</p><pre>{JSON.stringify(r.diagnostic,null,2)}</pre></details></section>}
<div className="result-boundary"><span>研究边注</span><p>正则BT模型描述成对选择的关联。Bootstrap条件于固定比较设计及成对iid计数，不是后验；作品名次不能替代人工策展审议。</p><a href="#/proposals" className="text-link">根据不稳定对照提出补票 →</a></div>
<div className="fingerprint">冻结快照指纹 <code>{r.fingerprint}</code></div>
</>}
</>}
