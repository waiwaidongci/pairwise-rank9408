from src.services import pair_service as service
def index(db,study_id):return service.list_pairs(db,study_id)
def create(db,data):return service.create_pair(db,data)

def update(db,id,data):return service.update_pair(db,id,data)
