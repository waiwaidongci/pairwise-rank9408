from pydantic import BaseModel,Field,ConfigDict,model_validator
from datetime import datetime
from src.constants.enums import ProposalStatus
class ProposalInput(BaseModel):
    name:str=Field(min_length=2,max_length=140)
    run_id:int
    left_id:int
    right_id:int
    extra_votes:int=Field(default=30,ge=10,le=200,strict=True)
    rationale:str=Field(min_length=10,max_length=1600)
class ReviewInput(BaseModel):
    status:ProposalStatus
    reviewer_note:str=Field(min_length=5,max_length=1000)
class ProposalOut(ProposalInput):
    id:int
    status:str
    reviewer_note:str
    reviewed_by:str
    created_at:datetime
    model_config=ConfigDict(from_attributes=True)
