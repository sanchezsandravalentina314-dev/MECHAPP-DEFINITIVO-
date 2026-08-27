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
