from services.base_service import BaseCRUDService
from models.modelos import MetodoPago

class MetodosPagoService(BaseCRUDService):
    def __init__(self):
        super().__init__(MetodoPago)

metodos_pago_service = MetodosPagoService()
