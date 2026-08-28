from sqlalchemy.orm import Session
from services.base_service import BaseCRUDService
from models.modelos import Cancha

class CanchasService(BaseCRUDService):
    def __init__(self):
        super().__init__(Cancha)

    def get_all(self, db: Session, skip: int = 0, limit: int = 100):
        # Por defecto mostramos solo las canchas activas (estado=True)
        # Esto cubre el requisito de que "cuando se cree una nueva cancha, los usuarios la vean" inmediatamente.
        return db.query(self.model).filter(self.model.estado == True).offset(skip).limit(limit).all()

    # Si se necesita ver todas (ej. para el propietario o admin):
    def get_all_admin(self, db: Session, skip: int = 0, limit: int = 100):
        return super().get_all(db, skip, limit)

canchas_service = CanchasService()
