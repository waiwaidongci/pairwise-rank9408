import json
from pathlib import Path
from sqlalchemy import select,func
from fastapi import HTTPException
from redis import Redis
from src.config.settings import REDIS_URL
from src.models import RankingRun
from src.services.study_service import get_study
from src.services.concept_service import list_concepts
from src.services.pair_service import list_pairs
from src.services.rank_bootstrap import analyze_ranking
from src.constants.enums import RunStatus
redis=Redis.from_url(REDIS_URL)
def list_runs(db):return db.scalars(select(RankingRun).order_by(RankingRun.id.desc())).all()
def get_run(db,id):
    item=db.get(RankingRun,id)
    if not item:raise HTTPException(404,'拟合任务不存在')
    return item

def create_run(db,data):
    study=get_study(db,data.study_id)
    if db.scalar(select(RankingRun).where(RankingRun.name==data.name)):raise HTTPException(409,'任务名称已存在')
    if db.scalar(select(func.count()).select_from(RankingRun).where(RankingRun.status.in_(['queued','running'])))>=3:raise HTTPException(429,'已有3项活动任务，请等待完成')
    concepts=[{k:getattr(c,k) for k in ('id','code','title','medium')} for c in list_concepts(db,study.id)]
    pairs=[{k:getattr(c,k) for k in ('id','left_id','right_id','left_wins','right_wins','source')} for c in list_pairs(db,study.id)]
    snapshot={'study':{'id':study.id,'code':study.code,'name':study.name,'source_file':study.source_file},'concepts':concepts,'pairs':pairs}
    item=RankingRun(**data.model_dump(),snapshot=snapshot,status=RunStatus.QUEUED);db.add(item);db.commit()
    # Database is authoritative; worker scans queued tasks even if Redis notification fails.
    try:redis.lpush('pairwise:runs',str(item.id))
    except Exception:pass
    return item

def execute_run(db,id):
    item=get_run(db,id)
    if item.status not in ('queued','running'):return
    item.status=RunStatus.RUNNING;db.commit()
    try:
        result=analyze_ranking(item.snapshot,item.ridge,item.repeats,item.seed,lambda:Path('/tmp/heartbeat').touch())
        Path('/artifacts').mkdir(exist_ok=True);Path(f'/artifacts/run-{id}.json').write_text(json.dumps(result,ensure_ascii=False,allow_nan=False))
        item.result=result;item.error='';item.status=RunStatus.COMPLETED;db.commit()
    except Exception as exc:
        db.rollback();item=get_run(db,id);item.status=RunStatus.FAILED;item.error=str(exc)[:600];db.commit()
