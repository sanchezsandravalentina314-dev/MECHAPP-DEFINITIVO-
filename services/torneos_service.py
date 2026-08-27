from services.base_service import BaseCRUDService
from models.modelos import Torneo

class TorneosService(BaseCRUDService):
    def __init__(self):
        super().__init__(Torneo)

torneos_service = TorneosService()
