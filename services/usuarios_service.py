from services.base_service import BaseCRUDService
from models.modelos import Usuario
from utils.security import hash_password

class UsuarioService(BaseCRUDService):
    def __init__(self):
        super().__init__(Usuario)

    def create(self, db, data):
        data = data.copy()
        if data.get("contrasena"):
            data["contrasena"] = hash_password(data["contrasena"])
        return super().create(db, data)

    def update(self, db, item_id, data):
        data = data.copy()
        if data.get("contrasena"):
            data["contrasena"] = hash_password(data["contrasena"])
        return super().update(db, item_id, data)

usuarios_service = UsuarioService()
