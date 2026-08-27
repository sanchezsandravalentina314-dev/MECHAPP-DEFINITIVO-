from services.base_service import BaseCRUDService
from models.modelos import Partido

class PartidasService(BaseCRUDService):
    def __init__(self):
        super().__init__(Partido)

partidas_service = PartidasService()
