from fastapi import APIRouter,Depends
from src.config.database import get_db
from src.utils.auth import current_user,editor,admin
from src.schemas.pair import PairInput,PairOut
from src.controllers import pair_controller as controller
router=APIRouter(prefix='/pairs',tags=['pairs'])
@router.get('',response_model=list[PairOut])
def index(study_id:int,db=Depends(get_db),user=Depends(current_user)):return controller.index(db,study_id)
@router.post('',response_model=PairOut,status_code=201)
def create(data:PairInput,db=Depends(get_db),user=Depends(editor)):return controller.create(db,data)
@router.put('/{id}',response_model=PairOut)
def update(id:int,data:PairInput,db=Depends(get_db),user=Depends(editor)):return controller.update(db,id,data)
