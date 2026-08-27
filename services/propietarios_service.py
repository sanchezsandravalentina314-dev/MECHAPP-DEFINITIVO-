"""
Servicio del módulo de propietarios.
"""
from services.base_service import BaseCRUDService
from models.modelos import Propietario


class PropietarioService(BaseCRUDService):
    def __init__(self):
        super().__init__(Propietario)


propietarios_service = PropietarioService()
