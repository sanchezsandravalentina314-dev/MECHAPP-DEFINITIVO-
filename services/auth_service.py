from datetime import timedelta
from sqlalchemy.orm import Session
from models.modelos import Usuario
from utils.security import hash_password, verify_password, create_access_token, decode_access_token

class AuthService:
    def get_by_correo(self, db: Session, correo: str):
        return db.query(Usuario).filter(Usuario.correo == correo).first()

    def get_by_id(self, db: Session, id_usuario: int):
        return db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()

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

    def generar_token_reset(self, usuario: Usuario) -> str:
        """Genera un token JWT de corta duración (30 min) para recuperar contraseña."""
        return create_access_token(
            {"sub": str(usuario.id_usuario), "tipo": "reset"},
            expires_delta=timedelta(minutes=30)
        )

    def verificar_token_reset(self, token: str):
        """Verifica que el token sea válido y sea de tipo reset. Retorna el payload o None."""
        payload = decode_access_token(token)
        if not payload:
            return None
        if payload.get("tipo") != "reset":
            return None
        return {"id_usuario": int(payload["sub"])}

    def cambiar_contrasena(self, db: Session, id_usuario: int, nueva_contrasena: str):
        """Actualiza la contraseña del usuario en la base de datos."""
        usuario = self.get_by_id(db, id_usuario)
        if not usuario:
            return False
        usuario.contrasena = hash_password(nueva_contrasena)
        db.commit()
        return True

auth_service = AuthService()
