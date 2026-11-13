from src.services import proposal_service as service
def index(db):return service.list_proposals(db)
def create(db,data):return service.create_proposal(db,data)

def review(db,id,data,user):return service.review_proposal(db,id,data,user)
def export(db,id):return service.export_proposal(db,id)
