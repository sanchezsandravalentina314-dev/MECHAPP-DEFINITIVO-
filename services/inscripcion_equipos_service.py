from services.base_service import BaseCRUDService
from models.modelos import InscripcionEquipo

class InscripcionEquiposService(BaseCRUDService):
    def __init__(self):
        super().__init__(InscripcionEquipo)

inscripcion_equipos_service = InscripcionEquiposService()
