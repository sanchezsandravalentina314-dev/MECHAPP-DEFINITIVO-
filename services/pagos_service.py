from services.base_service import BaseCRUDService
from models.modelos import Pago

class PagosService(BaseCRUDService):
    def __init__(self):
        super().__init__(Pago)

pagos_service = PagosService()
