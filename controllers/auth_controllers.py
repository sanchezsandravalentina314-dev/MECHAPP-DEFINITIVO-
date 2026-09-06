from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from schemas.auth_schema import UsuarioRegistro, UsuarioLogin, Token, SolicitudRecuperacion, RestablecerContrasena
from services.auth_service import auth_service
from utils.email_service import enviar_bienvenida, enviar_recuperacion_contrasena
import threading

def registrar_usuario(db: Session, datos: UsuarioRegistro):
    if auth_service.get_by_correo(db, datos.correo):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Ya existe una cuenta con ese correo.")
    usuario = auth_service.registrar(db, datos.model_dump())
    token = auth_service.generar_token(usuario)
    # Enviar correo de bienvenida en segundo plano (no bloquea el registro)
    threading.Thread(
        target=enviar_bienvenida,
        args=(usuario.correo, usuario.nombre),
        daemon=True
    ).start()
    return Token(access_token=token, usuario=usuario)

def login_usuario(db: Session, datos: UsuarioLogin):
    usuario = auth_service.autenticar(db, datos.correo, datos.contrasena)
    if not usuario:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Correo o contraseña incorrectos.")
    token = auth_service.generar_token(usuario)
    return Token(access_token=token, usuario=usuario)

def solicitar_recuperacion(db: Session, datos: SolicitudRecuperacion):
    usuario = auth_service.get_by_correo(db, datos.correo)
    if not usuario:
        # Por seguridad no revelamos si existe o no
        return {"mensaje": "Si el correo está registrado, recibirás un enlace de recuperación."}
    token_reset = auth_service.generar_token_reset(usuario)
    threading.Thread(
        target=enviar_recuperacion_contrasena,
        args=(usuario.correo, usuario.nombre, token_reset),
        daemon=True
    ).start()
    return {"mensaje": "Si el correo está registrado, recibirás un enlace de recuperación."}

def restablecer_contrasena(db: Session, datos: RestablecerContrasena):
    usuario = auth_service.verificar_token_reset(datos.token)
    if not usuario:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="El enlace de recuperación es inválido o ha expirado.")
    auth_service.cambiar_contrasena(db, usuario["id_usuario"], datos.nueva_contrasena)
    return {"mensaje": "Contraseña restablecida exitosamente. Ya puedes iniciar sesión."}

