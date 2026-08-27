from services.base_service import BaseCRUDService
from models.modelos import Equipo

class EquiposService(BaseCRUDService):
    def __init__(self):
        super().__init__(Equipo)

equipos_service = EquiposService()
