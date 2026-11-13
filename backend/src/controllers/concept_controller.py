from src.services import concept_service as service
def index(db,study_id):return service.list_concepts(db,study_id)
def create(db,data):return service.create_concept(db,data)
