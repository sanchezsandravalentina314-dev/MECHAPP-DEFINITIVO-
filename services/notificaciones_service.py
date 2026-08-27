from services.base_service import BaseCRUDService
from models.modelos import Notificacion

class NotificacionesService(BaseCRUDService):
    def __init__(self):
        super().__init__(Notificacion)

notificaciones_service = NotificacionesService()
