from pydantic import BaseModel,Field,ConfigDict,model_validator
class PairInput(BaseModel):
    study_id:int
    left_id:int
    right_id:int
    left_wins:int=Field(ge=0,le=1000,strict=True)
    right_wins:int=Field(ge=0,le=1000,strict=True)
    source:str=Field(default='',max_length=160)
    @model_validator(mode='after')
    def valid_edge(self):
        if self.left_id==self.right_id:raise ValueError('不允许作品自比')
        if self.left_wins+self.right_wins==0:raise ValueError('每条比较边须至少一票')
        return self
class PairOut(PairInput):
    id:int
    model_config=ConfigDict(from_attributes=True)
