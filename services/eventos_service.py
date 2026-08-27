"""
Servicio del módulo de eventos.
"""
from services.base_service import BaseCRUDService
from models.modelos import Evento


class EventoService(BaseCRUDService):
    def __init__(self):
        super().__init__(Evento)


eventos_service = EventoService()
