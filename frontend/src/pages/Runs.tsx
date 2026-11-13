import {useEffect,useState} from 'react';import {loadStudies,studyStore} from '../stores/studies';import {researchStore,loadRuns,queue,selectRun} from '../stores/research';import {authStore,canEdit} from '../stores/auth';import {useTask} from '../hooks/useTask';import {usePolling} from '../hooks/usePolling';import {date} from '../utils/format';import PageHeading from '../components/common/PageHeading';import ErrorNotice from '../components/common/ErrorNotice';import StatusBadge from '../components/common/StatusBadge';import StudySelect from '../components/StudySelect';export default function Runs(){const {selected}=studyStore.use(),{runs}=researchStore.use(),{user}=authStore.use(),{error,busy,perform}=useTask(),[name,setName]=useState('滨河方案 · 第一轮名次重现');useEffect(()=>{perform(loadStudies);perform(loadRuns)},[]);usePolling(loadRuns);return <>
<PageHeading no="03" title="拟合工作台" sub="冻结当前票数，提交一项可复算的正则比较研究。"/>
<ErrorNotice error={error}/>
<div className="run-spread">
<section>
<StudySelect/>
<form className="run-form" onSubmit={e=>{e.preventDefault();const d=new FormData(e.currentTarget);perform(async()=>{await queue({study_id:selected,name,ridge:Number(d.get('ridge')),repeats:Number(d.get('repeats')),seed:Number(d.get('seed'))});setName('滨河方案 · 复核 '+new Date().toLocaleTimeString())})}}>
<label>研究名称<input value={name} onChange={e=>setName(e.target.value)} minLength={2} maxLength={140} required/>
</label>
<div className="two-col">
<label>固定正则强度 λ<input name="ridge" type="number" defaultValue="1" min="0.01" max="10" step="0.01" required/>
</label>
<label>Bootstrap重复次数<input name="repeats" type="number" defaultValue="100" min="50" max="200" step="1" required/>
</label>
</div>
<label>随机种子<input name="seed" type="number" defaultValue="20261112" min="0" max="2147483647" step="1" required/>
</label>
<p className="formula">p(i ≻ j) = logistic(θᵢ − θⱼ)<br/>
<span>Σθ = 0　 ·　惩罚 = λ / 2 × Σθ²</span>
</p>
<p className="muted">λ在任务内固定为正，防止完全分离；不同λ的能力尺度不可直接混读。名次并列采用平均名次。</p>
<button className="primary" disabled={busy||!canEdit(user)}>{busy?'提交中…':'冻结票数并排队 →'}</button>{!canEdit(user)&&<p className="margin-note">观察员可读取结果；请策展分析员提交计算。</p>}</form>
<aside className="margin-note">
<b>每一次重现，重新拟合</b>
<p>每对总票数固定，按该对观测胜率抽取Binomial票数；保留每次能力与名次。它刻画成对iid假设下的重采样变化，不是贝叶斯后验。</p>
<p>单任务≤30作品、300边、200重复；全局最多3个排队或运行任务。断连与无票输入会留下可追溯失败态。</p>
</aside>
</section>
<section className="run-ledger">
<h2 className="ruled-title">演算队列 <small>{runs.length}项</small>
</h2>{!runs.length&&<div className="empty">
<h3>第一份研究，尚未写下。</h3>
<p>核对票数后从左侧排队。worker将执行图校验、能力拟合及完整bootstrap。</p>
</div>}{runs.map(r=>
<article key={r.id} className="run-entry">
<div className="entry-top">
<span>NO. {String(r.id).padStart(3,'0')}</span>
<StatusBadge status={r.status}/>
</div>
<h3>{r.name}</h3>
<p>λ {r.ridge} / {r.repeats}次重拟合 / seed {r.seed}</p>
<small>{date(r.created_at)} · 冻结{r.snapshot.concepts.length}作品 / {r.snapshot.pairs.length}边</small>{r.error&&<p className="error-text">{r.error}</p>}{r.status==='completed'&&<a href="#/results" className="text-link" onClick={()=>selectRun(r.id)}>阅读能力与名次重现 ↗</a>}{['queued','running'].includes(r.status)&&<p className="working">队列每2.5秒刷新，离开页面不影响计算。</p>}</article>)}</section>
</div>
</>}
