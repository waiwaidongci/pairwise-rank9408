import {useEffect,useState} from 'react';import {studyStore,loadStudies} from '../stores/studies';import {inputStore,loadInputs,addConcept,savePair} from '../stores/inputs';import {authStore,canEdit} from '../stores/auth';import {useTask} from '../hooks/useTask';import PageHeading from '../components/common/PageHeading';import ErrorNotice from '../components/common/ErrorNotice';import StudySelect from '../components/StudySelect';import type {Pair} from '../types/domain';export default function Sources(){const {selected}=studyStore.use(),{concepts,pairs}=inputStore.use(),{user}=authStore.use(),{error,busy,perform}=useTask();const [edit,setEdit]=useState<Pair|null>(null),[success,setSuccess]=useState('');useEffect(()=>{perform(loadStudies)},[]);useEffect(()=>{if(selected){setEdit(null);setSuccess('');perform(()=>loadInputs(selected))}},[selected]);const title=(id:number)=>{const c=concepts.find(c=>c.id===id);return c?c.code+' '+c.title:String(id)};return <>
<PageHeading no="02" title="票数核对" sub="一次独立成对选择计为一票；先汇总同一作品对，再进入研究。"/>
<StudySelect/>
<ErrorNotice error={error}/>{success&&<p role="status" className="success">{success}</p>}<section className="input-spread">
<div>
<h2 className="ruled-title">匿名作品名录 <small>{concepts.length}项</small>
</h2>
<div className="concept-index">{concepts.map(c=>
<div key={c.id}>
<b>{c.code}</b>
<span>{c.title}<small>{c.medium}</small>
</span>
</div>)}</div>{!concepts.length&&<p className="empty">请先登记至少两项作品，再录入比较票数。</p>}{canEdit(user)&&<details className="edit-fold">
<summary>＋ 登记作品方案</summary>
<form onSubmit={e=>{e.preventDefault();const f=e.currentTarget,d=new FormData(f);perform(async()=>{await addConcept({...Object.fromEntries(d),study_id:selected},selected);f.reset();setSuccess('作品已登记，可录入新的成对票数。')})}}>
<label>作品编号<input name="code" minLength={2} required/>
</label>
<label>匿名标题<input name="title" minLength={2} required/>
</label>
<label>媒介<input name="medium"/>
</label>
<button disabled={busy}>登记作品</button>
</form>
</details>}<aside className="margin-note">
<b>核对边界</b>
<p>自比、负票、非整数、空票边和重复无向边会被拒绝。零胜票可以存在，只要该对总票数为正。</p>
<p>连通性基于全部已登记作品；孤立作品会导致任务失败。修改票数后请重新排队，既有快照保留。</p>
</aside>
</div>
<div>
<h2 className="ruled-title">比较票数台账 <small>{pairs.length}对</small>
</h2>{canEdit(user)&&<details className="edit-fold" open={!!edit}>
<summary>{edit?'编辑比较 #'+edit.id:'＋ 录入一组成对票数'}</summary>
<form key={edit?.id||'new'} className="form-grid" onSubmit={e=>{e.preventDefault();const d=new FormData(e.currentTarget);perform(async()=>{await savePair({study_id:selected,left_id:Number(d.get('left_id')),right_id:Number(d.get('right_id')),left_wins:Number(d.get('left_wins')),right_wins:Number(d.get('right_wins')),source:d.get('source')},selected,edit?.id);setEdit(null);setSuccess('票数已保存；已有研究快照不会被改写。')})}}>
<label>左侧作品<select name="left_id" defaultValue={edit?.left_id||concepts[0]?.id}>{concepts.map(c=>
<option key={c.id} value={c.id}>{c.code} {c.title}</option>)}</select>
</label>
<label>右侧作品<select name="right_id" defaultValue={edit?.right_id||concepts[1]?.id}>{concepts.map(c=>
<option key={c.id} value={c.id}>{c.code} {c.title}</option>)}</select>
</label>
<label>选择左侧的票数<input name="left_wins" type="number" min="0" max="1000" step="1" defaultValue={edit?.left_wins||0} required/>
</label>
<label>选择右侧的票数<input name="right_wins" type="number" min="0" max="1000" step="1" defaultValue={edit?.right_wins||0} required/>
</label>
<label className="full">票数来源<input name="source" defaultValue={edit?.source||''}/>
</label>
<div className="button-row">
<button className="primary" disabled={busy}>保存票数</button>{edit&&<button type="button" onClick={()=>setEdit(null)}>取消编辑</button>}</div>
</form>
</details>}<div className="table-scroll">
<table>
<thead>
<tr>
<th>作品对</th>
<th>左票</th>
<th>右票</th>
<th>总票</th>{canEdit(user)&&<th/>}</tr>
</thead>
<tbody>{pairs.map(p=>
<tr key={p.id}>
<td>
<b>{title(p.left_id)}</b>
<small>对 {title(p.right_id)}</small>
</td>
<td>{p.left_wins}</td>
<td>{p.right_wins}</td>
<td>{p.left_wins+p.right_wins}</td>{canEdit(user)&&<td>
<button className="small-button" onClick={()=>setEdit(p)}>编辑</button>
</td>}</tr>)}</tbody>
</table>
</div>{!pairs.length&&<p className="empty">还没有票数。录入一对作品的两侧计数，逐步连通比较网络。</p>}</div>
</section>
</>}
