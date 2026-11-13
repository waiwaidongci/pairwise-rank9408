from pydantic import BaseModel,Field,ConfigDict,model_validator
class ConceptInput(BaseModel):
    study_id:int
    code:str=Field(min_length=2,max_length=40,pattern=r'^[A-Za-z0-9_-]+$')
    title:str=Field(min_length=2,max_length=100)
    medium:str=Field(default='',max_length=100)
class ConceptOut(ConceptInput):
    id:int
    model_config=ConfigDict(from_attributes=True)
