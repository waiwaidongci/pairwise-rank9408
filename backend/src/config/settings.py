import os
DATABASE_URL=os.getenv('DATABASE_URL','postgresql+psycopg://pairwise:pairwise-demo-local@localhost:17724/pairwise')
REDIS_URL=os.getenv('REDIS_URL','redis://localhost:6379/0')
JWT_SECRET=os.getenv('JWT_SECRET','local-pairwise-rank-change-this-before-hosting')
SEED_DEMO=os.getenv('SEED_DEMO','false').lower()=='true'
