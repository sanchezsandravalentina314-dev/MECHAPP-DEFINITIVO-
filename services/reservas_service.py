from services.base_service import BaseCRUDService
from models.modelos import Reserva

class ReservasService(BaseCRUDService):
    def __init__(self):
        super().__init__(Reserva)

reservas_service = ReservasService()
