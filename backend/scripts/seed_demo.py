"""Natural-key insert-only fixtures; never overwrite user edits or queue a run."""
import numpy as np
from scipy.special import expit
from sqlalchemy import select,or_,and_
from src.config.database import Base,engine,Session
from src.models import User,ComparisonStudy,Concept,PairCount
from src.utils.security import hash_password

def seed():
    Base.metadata.create_all(engine)
    with Session() as db:
        for role,name in [('admin','梁晴 · 策展负责人'),('analyst','许澄 · 策展分析员'),('viewer','周原 · 委托方观察员')]:
            email=role+'@xianxu.local'
            if not db.scalar(select(User).where(User.email==email)):db.add(User(email=email,name=name,role=role,password_hash=hash_password('Xianxu2026!')))
        db.flush()
        for code,name,context,file in [('XX-2026','滨河公共艺术 · 匿名方案评议','12项机构作品，独立匿名成对票数；研究仅支持补充评议，不自动立项。','滨河匿名成对票数_20261112.csv'),('XX-BAL','均衡两项 · 校准研究','相同票数的对称校准，不表示所有作品一样好。','balanced_10_10.csv'),('XX-DISC','断连比较 · 失败校准','两组各自有票，禁止强行跨组排序。','disconnected_pairs.csv')]:
            s=db.scalar(select(ComparisonStudy).where(ComparisonStudy.code==code))
            if not s:s=ComparisonStudy(code=code,name=name,context=context,source_file=file);db.add(s);db.flush()
            if code=='XX-2026':names=['回声廊','水纹折页','风的尺度','岸线织构','石上微光','浮岛书简','树影合奏','日晷回环','涟漪之门','雨后刻度','慢行波谱','向水而生'];abilities=np.array([.85,.70,.62,.38,.30,.12,-.05,-.16,-.37,-.50,-.73,-.94]);rng=np.random.default_rng(20261112)
            else:names=['校准甲','校准乙'] if code=='XX-BAL' else ['独立组甲一','独立组甲二','独立组乙一','独立组乙二']
            cs=[]
            for i,name in enumerate(names):
                c=db.scalar(select(Concept).where(Concept.study_id==s.id,Concept.code==f'XX{i+1:02}'))
                if not c:c=Concept(study_id=s.id,code=f'XX{i+1:02}',title=name,medium=['金属构架','石材装置','场地织构'][i%3]);db.add(c);db.flush()
                cs.append(c)
            for i in range(len(cs)):
                for j in range(i+1,len(cs)):
                    if code=='XX-2026':
                        # The first four cyclic distances form 48 unique comparisons.
                        if min(j-i,len(cs)-(j-i))>4:continue
                        n=int(rng.integers(20,51));w=int(rng.binomial(n,expit(abilities[i]-abilities[j])))
                    elif code=='XX-BAL':n=20;w=10
                    else:
                        if (i,j) not in [(0,1),(2,3)]:continue
                        n=20;w=12
                    if not db.scalar(select(PairCount).where(PairCount.study_id==s.id,or_(and_(PairCount.left_id==cs[i].id,PairCount.right_id==cs[j].id),and_(PairCount.left_id==cs[j].id,PairCount.right_id==cs[i].id)))):db.add(PairCount(study_id=s.id,left_id=cs[i].id,right_id=cs[j].id,left_wins=w,right_wins=n-w,source=s.source_file))
        db.commit()
if __name__=='__main__':seed();print('seed insert-only complete')
