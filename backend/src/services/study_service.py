from sqlalchemy import select
from fastapi import HTTPException
from src.models import ComparisonStudy

def list_studies(db):return db.scalars(select(ComparisonStudy).order_by(ComparisonStudy.id)).all()
def get_study(db,id):
    item=db.get(ComparisonStudy,id)
    if not item:raise HTTPException(404,'评议研究不存在')
    return item

def create_study(db,data):
    if db.scalar(select(ComparisonStudy).where(ComparisonStudy.code==data.code)):raise HTTPException(409,'研究编号已存在')
    item=ComparisonStudy(**data.model_dump());db.add(item);db.commit();return item

def update_study(db,id,data):
    item=get_study(db,id)
    if db.scalar(select(ComparisonStudy).where(ComparisonStudy.code==data.code,ComparisonStudy.id!=id)):raise HTTPException(409,'研究编号已存在')
    for k,v in data.model_dump().items():setattr(item,k,v)
    db.commit();return item
