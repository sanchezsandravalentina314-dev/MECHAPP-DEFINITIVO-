from services.base_service import BaseCRUDService
from models.modelos import Valoracion

class ValoracionesService(BaseCRUDService):
    def __init__(self):
        super().__init__(Valoracion)

valoraciones_service = ValoracionesService()
