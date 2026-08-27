from services.base_service import BaseCRUDService
from models.modelos import Inscripcion

class InscripcionesService(BaseCRUDService):
    def __init__(self):
        super().__init__(Inscripcion)

inscripciones_service = InscripcionesService()
