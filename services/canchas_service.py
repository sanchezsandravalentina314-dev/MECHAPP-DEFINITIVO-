from services.base_service import BaseCRUDService
from models.modelos import Cancha

class CanchasService(BaseCRUDService):
    def __init__(self):
        super().__init__(Cancha)

canchas_service = CanchasService()
