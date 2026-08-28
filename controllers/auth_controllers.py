from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from schemas.auth_schema import UsuarioRegistro, UsuarioLogin, Token
from services.auth_service import auth_service

def registrar_usuario(db: Session, datos: UsuarioRegistro):
    if auth_service.get_by_correo(db, datos.correo):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Ya existe una cuenta con ese correo.")
    usuario = auth_service.registrar(db, datos.model_dump())
    token = auth_service.generar_token(usuario)
    return Token(access_token=token, usuario=usuario)

def login_usuario(db: Session, datos: UsuarioLogin):
    usuario = auth_service.autenticar(db, datos.correo, datos.contrasena)
    if not usuario:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Correo o contraseña incorrectos.")
    token = auth_service.generar_token(usuario)
    return Token(access_token=token, usuario=usuario)
from utils.security import hash_password, verify_password
from schemas.auth_schema import CambioContrasena
from models.modelos import Usuario

def cambiar_contrasena(db: Session, usuario: Usuario, datos: CambioContrasena):
    # Verificar la contrasena actual
    if not verify_password(datos.contrasena_actual, usuario.contrasena):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="La contraseña actual es incorrecta.")
    
    # Actualizar y hashear la nueva
    usuario.contrasena = hash_password(datos.nueva_contrasena)
    db.commit()
    return {"mensaje": "Contraseña actualizada exitosamente."}
