from services.base_service import BaseCRUDService
from models.modelos import Resultado

class ResultadosService(BaseCRUDService):
    def __init__(self):
        super().__init__(Resultado)

resultados_service = ResultadosService()
