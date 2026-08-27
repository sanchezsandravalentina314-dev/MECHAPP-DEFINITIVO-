from services.base_service import BaseCRUDService
from models.modelos import EquipoJugador

class EquipoJugadorService(BaseCRUDService):
    def __init__(self):
        super().__init__(EquipoJugador)

equipo_jugador_service = EquipoJugadorService()
