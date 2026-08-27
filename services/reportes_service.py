"""
Servicio del módulo de reportes.
"""
from services.base_service import BaseCRUDService
from models.modelos import Reporte


class ReporteService(BaseCRUDService):
    def __init__(self):
        super().__init__(Reporte)


reportes_service = ReporteService()
