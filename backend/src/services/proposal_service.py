import csv,io
from sqlalchemy import select
from fastapi import HTTPException
from src.models import ReviewProposal
from src.services.run_service import get_run

def list_proposals(db):return db.scalars(select(ReviewProposal).order_by(ReviewProposal.id.desc())).all()
def create_proposal(db,data):
    run=get_run(db,data.run_id)
    if run.status!='completed':raise HTTPException(409,'只可依据已完成的拟合提出补票建议')
    ids={c['id'] for c in run.result['concepts']}
    if data.left_id==data.right_id or data.left_id not in ids or data.right_id not in ids:raise HTTPException(422,'补票须选择本次快照中的两项不同作品')
    if db.scalar(select(ReviewProposal).where(ReviewProposal.name==data.name)):raise HTTPException(409,'提案名称已存在')
    item=ReviewProposal(**data.model_dump());db.add(item);db.commit();return item

def review_proposal(db,id,data,user):
    item=db.get(ReviewProposal,id)
    if not item:raise HTTPException(404,'补票提案不存在')
    if item.status!='draft':raise HTTPException(409,'提案已审阅，不能覆盖历史决定')
    if data.status not in ('approved','rejected'):raise HTTPException(422,'请选择批准或退回')
    item.status=data.status;item.reviewer_note=data.reviewer_note;item.reviewed_by=user.email;db.commit();return item

def export_proposal(db,id):
    item=db.get(ReviewProposal,id)
    if not item:raise HTTPException(404,'补票提案不存在')
    if item.status!='approved':raise HTTPException(409,'仅已批准的补票提案可以分发')
    run=get_run(db,item.run_id);result=run.result;out=io.StringIO();writer=csv.writer(out)
    writer.writerow(['proposal','reviewer','note','fingerprint','ridge','repeats','seed','left_id','right_id','extra_votes','scope'])
    writer.writerow([item.name,item.reviewed_by,item.reviewer_note,result['fingerprint'],run.ridge,run.repeats,run.seed,item.left_id,item.right_id,item.extra_votes,'补充评议调度；不自动立项；bootstrap不是后验'])
    writer.writerow(['code','title','ability_sum_zero','average_rank','rank_q025','rank_q975','first_place_share','rank_frequency'])
    for c in result['concepts']:writer.writerow([c['code'],c['title'],c['ability'],c['rank'],c['rank_low'],c['rank_high'],c['first_share'],str(c['rank_frequency'])])
    writer.writerow(['left_code','right_code','probability_model'])
    for i,c in enumerate(result['concepts']):
        for j in range(i+1,len(result['concepts'])):writer.writerow([c['code'],result['concepts'][j]['code'],result['probabilities'][i][j]])
    return '\ufeff'+out.getvalue()
