from datetime import datetime
from sqlalchemy import String,ForeignKey,UniqueConstraint,DateTime,JSON,Double
from sqlalchemy.orm import Mapped,mapped_column
from src.config.database import Base
class PairCount(Base):
    __tablename__='pair_counts'
    id:Mapped[int]=mapped_column(primary_key=True)
    study_id:Mapped[int]=mapped_column(ForeignKey('comparison_studies.id'))
    left_id:Mapped[int]=mapped_column(ForeignKey('concepts.id'))
    right_id:Mapped[int]=mapped_column(ForeignKey('concepts.id'))
    left_wins:Mapped[int]=mapped_column()
    right_wins:Mapped[int]=mapped_column()
    source:Mapped[str]=mapped_column(String(160),default='')
    __table_args__=(UniqueConstraint('study_id','left_id','right_id'),)
