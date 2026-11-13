import {useEffect,useState} from 'react';import {studyStore,loadStudies,saveStudy} from '../stores/studies';import {inputStore,loadInputs} from '../stores/inputs';import {researchStore,loadRuns} from '../stores/research';import {authStore,canEdit} from '../stores/auth';import {useTask} from '../hooks/useTask';import StudySelect from '../components/StudySelect';import ComparisonGraph from '../components/ComparisonGraph';import ErrorNotice from '../components/common/ErrorNotice';export default function Overview(){const {items,selected}=studyStore.use(),{concepts,pairs}=inputStore.use(),{runs}=researchStore.use(),{user}=authStore.use();const {error,perform}=useTask();const [open,setOpen]=useState(false);useEffect(()=>{perform(loadStudies);perform(loadRuns)},[]);useEffect(()=>{if(selected)perform(()=>loadInputs(selected))},[selected]);const study=items.find(s=>s.id===selected);return <>
<div className="folio-line">
<span>RESEARCH FOLIO / 2026.11</span>
<span>17位策展研究员 · 匿名作品方案</span>
</div>
<StudySelect/>
<ErrorNotice error={error}/>
<section className="opening">
<div className="opening-copy">
<p className="eyebrow">01 / COMPARISON BEFORE CONCLUSION</p>
<h1>从一场对照，<br/>听见偏好的<span>轮廓。</span>
</h1>
<p className="lead">单次胜率之外，还有对手的差异，<br className="desktop"/>以及名次能否重现的疑问。</p>
<div className="study-caption">
<b>{study?.name}</b>
<p>{study?.context}</p>
<small>来源 / {study?.source_file}</small>
</div>
<a className="text-link" href="#/sources">核对比较网络 ↗</a>
</div>
<figure className="network-figure">
<ComparisonGraph concepts={concepts} pairs={pairs}/>
<figcaption>
<span>图 01　真实票数形成的比较关系</span>
<span>线宽随总票数变化</span>
</figcaption>
</figure>
</section>
<section className="score-strip">
<div>
<small>匿名作品方案</small>
<strong>{concepts.length}<i>项</i>
</strong>
</div>
<div>
<small>有票比较边</small>
<strong>{pairs.length}<i>对</i>
</strong>
</div>
<div>
<small>独立成对票数</small>
<strong>{pairs.reduce((n,p)=>n+p.left_wins+p.right_wins,0).toLocaleString()}<i>票</i>
</strong>
</div>
<p>能力采用总和为零的尺度。<br/>bootstrap呈现重采样名次变化，<br/>不表示“作品最优”的后验概率。</p>
</section>
<section className="workflow-row">
<div>
<span>Ⅰ</span>
<h3>核对</h3>
<p>作品、票数与完整比较网络</p>
<a href="#/sources">打开输入数据 →</a>
</div>
<div>
<span>Ⅱ</span>
<h3>拟合与重现</h3>
<p>正则能力、对手胜率、名次范围</p>
<a href="#/runs">配置一次研究 →</a>
</div>
<div>
<span>Ⅲ</span>
<h3>补充评议</h3>
<p>{runs.filter(r=>r.status==='completed').length}项完成研究可作为补票依据</p>
<a href="#/proposals">提交人工审阅 →</a>
</div>
</section>{canEdit(user)&&<section className="registry">
<button className="text-link" onClick={()=>setOpen(!open)}>{open?'收起':'＋ 登记一份新研究'}</button>{open&&<form onSubmit={e=>{e.preventDefault();const d=new FormData(e.currentTarget);perform(async()=>{await saveStudy(Object.fromEntries(d));setOpen(false)})}} className="form-grid">
<label>研究编号<input name="code" required pattern="[A-Za-z0-9_-]+"/>
</label>
<label>研究名称<input name="name" required minLength={2}/>
</label>
<label>源文件名<input name="source_file"/>
</label>
<label>研究背景<textarea name="context"/>
</label>
<button className="primary">登记研究</button>
</form>}</section>}</>}
