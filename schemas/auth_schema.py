from typing import Optional
from datetime import date, datetime, time
from decimal import Decimal
from pydantic import BaseModel, ConfigDict

class UsuarioRegistro(BaseModel):
    id_rol: int
    nombre: str
    documento: str
    correo: str
    telefono: Optional[str] = None
    contrasena: str

class UsuarioLogin(BaseModel):
    correo: str
    contrasena: str

class UsuarioAuthResponse(BaseModel):
    id_usuario: int
    id_rol: int
    nombre: str
    documento: str
    correo: str
    telefono: Optional[str] = None
    estado: bool
    fecha_registro: datetime
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario: UsuarioAuthResponse
