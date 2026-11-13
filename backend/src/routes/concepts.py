from fastapi import APIRouter,Depends
from src.config.database import get_db
from src.utils.auth import current_user,editor,admin
from src.schemas.concept import ConceptInput,ConceptOut
from src.controllers import concept_controller as controller
router=APIRouter(prefix='/concepts',tags=['concepts'])
@router.get('',response_model=list[ConceptOut])
def index(study_id:int,db=Depends(get_db),user=Depends(current_user)):return controller.index(db,study_id)
@router.post('',response_model=ConceptOut,status_code=201)
def create(data:ConceptInput,db=Depends(get_db),user=Depends(editor)):return controller.create(db,data)
