from services.base_service import BaseCRUDService
from models.modelos import HorarioDisponible

class HorariosService(BaseCRUDService):
    def __init__(self):
        super().__init__(HorarioDisponible)

horarios_service = HorariosService()
