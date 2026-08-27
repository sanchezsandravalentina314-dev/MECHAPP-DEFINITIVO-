from sqlalchemy.orm import Session
from models.modelos import Usuario
from utils.security import hash_password, verify_password, create_access_token

class AuthService:
    def get_by_correo(self, db: Session, correo: str):
        return db.query(Usuario).filter(Usuario.correo == correo).first()

    def registrar(self, db: Session, datos: dict) -> Usuario:
        datos = datos.copy()
        contrasena = datos.pop("contrasena")
        datos["contrasena"] = hash_password(contrasena)
        usuario = Usuario(**datos)
        db.add(usuario)
        db.commit()
        db.refresh(usuario)
        return usuario

    def autenticar(self, db: Session, correo: str, contrasena: str):
        usuario = self.get_by_correo(db, correo)
        if not usuario or not verify_password(contrasena, usuario.contrasena):
            return None
        if not usuario.estado:
            return None
        return usuario

    def generar_token(self, usuario: Usuario) -> str:
        return create_access_token({
            "sub": str(usuario.id_usuario),
            "id_rol": usuario.id_rol,
        })

auth_service = AuthService()
