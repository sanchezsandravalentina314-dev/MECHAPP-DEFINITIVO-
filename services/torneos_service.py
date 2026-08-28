from sqlalchemy.orm import Session
from services.base_service import BaseCRUDService
from models.modelos import Torneo

class TorneosService(BaseCRUDService):
    def __init__(self):
        super().__init__(Torneo)

    def get_all(self, db: Session, skip: int = 0, limit: int = 100):
        # Retorna todos los torneos activos (todos los estados visibles al público)
        return db.query(self.model).offset(skip).limit(limit).all()

torneos_service = TorneosService()
