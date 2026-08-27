from services.base_service import BaseCRUDService
from models.modelos import Favorito

class FavoritosService(BaseCRUDService):
    def __init__(self):
        super().__init__(Favorito)

favoritos_service = FavoritosService()
