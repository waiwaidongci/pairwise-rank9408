from sqlalchemy import select,func,or_,and_
from fastapi import HTTPException
from src.models import PairCount,Concept
from src.services.study_service import get_study

def list_pairs(db,study_id):return db.scalars(select(PairCount).where(PairCount.study_id==study_id).order_by(PairCount.id)).all()
def validate_pair(db,data,exclude=None):
    get_study(db,data.study_id)
    for id in (data.left_id,data.right_id):
        c=db.get(Concept,id)
        if not c or c.study_id!=data.study_id:raise HTTPException(422,'两侧作品必须属于当前研究')
    a,b=sorted((data.left_id,data.right_id))
    found=db.scalar(select(PairCount).where(PairCount.study_id==data.study_id,or_(and_(PairCount.left_id==a,PairCount.right_id==b),and_(PairCount.left_id==b,PairCount.right_id==a))))
    if found and found.id!=exclude:raise HTTPException(409,'该作品对已有票数，请编辑既有比较')
def create_pair(db,data):
    validate_pair(db,data)
    if db.scalar(select(func.count()).select_from(PairCount).where(PairCount.study_id==data.study_id))>=300:raise HTTPException(422,'每研究最多300条边')
    item=PairCount(**data.model_dump());db.add(item);db.commit();return item

def update_pair(db,id,data):
    item=db.get(PairCount,id)
    if not item:raise HTTPException(404,'比较票数不存在')
    if item.study_id!=data.study_id:raise HTTPException(422,'不能迁移既有比较所属研究')
    validate_pair(db,data,id)
    for k,v in data.model_dump().items():setattr(item,k,v)
    db.commit();return item
