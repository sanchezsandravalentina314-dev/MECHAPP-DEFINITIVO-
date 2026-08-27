from services.base_service import BaseCRUDService
from models.modelos import Ubicacion

class UbicacionesService(BaseCRUDService):
    def __init__(self):
        super().__init__(Ubicacion)

ubicaciones_service = UbicacionesService()
