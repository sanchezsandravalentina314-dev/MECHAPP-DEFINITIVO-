from services.base_service import BaseCRUDService
from models.modelos import Rol

class RolesService(BaseCRUDService):
    def __init__(self):
        super().__init__(Rol)

roles_service = RolesService()
