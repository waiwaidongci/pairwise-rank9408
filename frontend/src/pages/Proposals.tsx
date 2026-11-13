import {useEffect,useState} from 'react';
import {researchStore,loadRuns,loadProposals,addProposal,reviewProposal} from '../stores/research';
import {authStore,canEdit} from '../stores/auth';import {useTask} from '../hooks/useTask';
import {download,date} from '../utils/format';import PageHeading from '../components/common/PageHeading';
import ErrorNotice from '../components/common/ErrorNotice';import StatusBadge from '../components/common/StatusBadge';
export default function Proposals(){const {runs,proposals}=researchStore.use(),{user}=authStore.use(),{error,busy,perform}=useTask(),[runId,setRunId]=useState(0),[message,setMessage]=useState('');
useEffect(()=>{perform(loadRuns);perform(loadProposals)},[]);const completed=runs.filter(r=>r.status==='completed'),run=completed.find(r=>r.id===runId)||completed[0],concepts=run?.result.concepts||[];
return <><PageHeading no="05" title="补票审阅" sub="把名次变化转化为可复核的补充评议，再由负责人决定是否安排。"/>
<ErrorNotice error={error}/>{message&&<p className="success" role="status">{message}</p>}
<div className="proposal-spread"><section><h2 className="ruled-title">写下一份补充评议提案</h2>
{!run?<div className="empty"><p>完成至少一项拟合后，才能选择快照内的作品。</p><a href="#/runs">先提交一次研究 →</a></div>:<form key={run.id} onSubmit={e=>{e.preventDefault();const f=e.currentTarget,d=new FormData(f);perform(async()=>{await addProposal({run_id:run.id,name:d.get('name'),left_id:Number(d.get('left_id')),right_id:Number(d.get('right_id')),extra_votes:Number(d.get('extra_votes')),rationale:d.get('rationale')});setMessage('补票提案已留档，等待策展负责人审阅。');f.reset()})}}>
<label>依据的完成研究<select aria-label="提案依据研究" value={run.id} onChange={e=>setRunId(Number(e.target.value))}>{completed.map(r=><option value={r.id} key={r.id}>#{r.id} {r.name}</option>)}</select></label>
<label>提案名称<input name="name" placeholder="例如：回声廊 × 水纹折页补票" required minLength={2}/></label>
<div className="two-col"><label>左侧作品<select name="left_id" defaultValue={concepts[0]?.id}>{concepts.map(c=><option key={c.id} value={c.id}>{c.code} {c.title}</option>)}</select></label><label>右侧作品<select name="right_id" defaultValue={concepts[1]?.id}>{concepts.map(c=><option key={c.id} value={c.id}>{c.code} {c.title}</option>)}</select></label></div>
<label>新增独立成对票数<input name="extra_votes" type="number" defaultValue="30" min="10" max="200" step="1" required/></label>
<label>补票依据<textarea name="rationale" required minLength={10} placeholder="描述名次范围重叠、比较覆盖或成对胜率接近的证据；不要把模型名次当作立项结论。" rows={5}/></label>
<button className="primary" disabled={busy||!canEdit(user)}>提交负责人审阅 →</button>
{!canEdit(user)&&<p className="margin-note">观察员只能阅读与下载已批准提案。</p>}
</form>}
<aside className="margin-note"><b>批准的是补充评议安排</b><p>审阅不会修改票数或自动启动下一轮。新增票数需回到核对台账录入，再创建新的拟合快照。</p><p>批准、退回及导出均留审计。已审阅的决定不能覆盖；修订时新建提案。</p></aside></section>
<section><h2 className="ruled-title">负责人审阅簿 <small>{proposals.length}份</small></h2>
{!proposals.length&&<div className="empty"><p>还没有提案。用模型结果说明需要补充哪一对比较、补多少票。</p></div>}
{proposals.map(p=><article className="proposal-entry" key={p.id}><div className="entry-top"><span>NOTE {String(p.id).padStart(3,'0')}</span><StatusBadge status={p.status}/></div><h3>{p.name}</h3><p className="proposal-rationale">{p.rationale}</p><dl><div><dt>研究快照</dt><dd>#{p.run_id}</dd></div><div><dt>作品对</dt><dd>{runs.find(r=>r.id===p.run_id)?.result.concepts.filter(c=>[p.left_id,p.right_id].includes(c.id)).map(c=>c.code+' '+c.title).join(' × ')}</dd></div><div><dt>新增票数</dt><dd>{p.extra_votes}票 · {date(p.created_at)}</dd></div></dl>
{p.reviewer_note&&<div className="reviewer-note"><b>负责人批注</b><p>{p.reviewer_note}</p><small>{p.reviewed_by}</small></div>}
{user?.role==='admin'&&p.status==='draft'&&<form onSubmit={e=>{e.preventDefault();const d=new FormData(e.currentTarget);perform(async()=>{await reviewProposal(p.id,String(d.get('status')),String(d.get('note')));setMessage('审阅决定已留档。')})}}><label>审阅批注<textarea name="note" minLength={5} required/></label><div className="button-row"><select name="status" aria-label="审阅决定"><option value="approved">同意补充评议</option><option value="rejected">退回修订</option></select><button disabled={busy}>留档决定</button></div></form>}
{p.status==='approved'&&<button className="text-link" onClick={()=>perform(()=>download(p.id))}>下载补充评议与模型摘要 CSV ↙</button>}
</article>)}
</section></div></>}
