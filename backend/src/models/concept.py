from datetime import datetime
from sqlalchemy import String,ForeignKey,UniqueConstraint,DateTime,JSON,Double
from sqlalchemy.orm import Mapped,mapped_column
from src.config.database import Base
class Concept(Base):
    __tablename__='concepts'
    id:Mapped[int]=mapped_column(primary_key=True)
    study_id:Mapped[int]=mapped_column(ForeignKey('comparison_studies.id'))
    code:Mapped[str]=mapped_column(String(40))
    title:Mapped[str]=mapped_column(String(100))
    medium:Mapped[str]=mapped_column(String(100),default='')
    __table_args__=(UniqueConstraint('study_id','code'),)
