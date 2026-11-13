from pydantic import BaseModel,Field,ConfigDict,model_validator
from datetime import datetime
class RunInput(BaseModel):
    name:str=Field(min_length=2,max_length=140)
    study_id:int
    ridge:float=Field(default=1.,ge=.01,le=10,allow_inf_nan=False)
    repeats:int=Field(default=100,ge=50,le=200,strict=True)
    seed:int=Field(default=20261112,ge=0,le=2147483647,strict=True)
class RunOut(RunInput):
    id:int
    status:str
    snapshot:dict
    result:dict
    error:str
    created_at:datetime
    model_config=ConfigDict(from_attributes=True)
