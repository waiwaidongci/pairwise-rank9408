from sqlalchemy import select,func
from fastapi import HTTPException
from src.models import Concept
from src.services.study_service import get_study

def list_concepts(db,study_id):return db.scalars(select(Concept).where(Concept.study_id==study_id).order_by(Concept.code)).all()
def create_concept(db,data):
    get_study(db,data.study_id)
    if db.scalar(select(Concept).where(Concept.study_id==data.study_id,Concept.code==data.code)):raise HTTPException(409,'该研究已有此作品编号')
    if db.scalar(select(func.count()).select_from(Concept).where(Concept.study_id==data.study_id))>=30:raise HTTPException(422,'每研究最多30项作品')
    item=Concept(**data.model_dump());db.add(item);db.commit();return item
