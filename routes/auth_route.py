from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config.database import get_db
from schemas.auth_schema import UsuarioRegistro, UsuarioLogin, Token
from controllers import auth_controllers

router = APIRouter(prefix="/api/auth", tags=["Autenticación"])

@router.post("/registro", response_model=Token, status_code=201)
def registro(datos: UsuarioRegistro, db: Session = Depends(get_db)):
    return auth_controllers.registrar_usuario(db, datos)

@router.post("/login", response_model=Token)
def login(datos: UsuarioLogin, db: Session = Depends(get_db)):
    return auth_controllers.login_usuario(db, datos)
from utils.dependencies import get_current_user
from models.modelos import Usuario
from schemas.auth_schema import CambioContrasena

@router.put("/cambiar-contrasena")
def cambiar_contrasena(datos: CambioContrasena, db: Session = Depends(get_db), usuario: Usuario = Depends(get_current_user)):
    return auth_controllers.cambiar_contrasena(db, usuario, datos)
