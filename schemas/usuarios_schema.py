from typing import Optional
from datetime import date, datetime, time
from decimal import Decimal
from pydantic import BaseModel, ConfigDict

class UsuarioBase(BaseModel):
    id_rol: int
    nombre: str
    documento: str
    correo: str
    telefono: Optional[str] = None
    estado: bool = True

class UsuarioCreate(UsuarioBase):
    contrasena: str

class UsuarioUpdate(BaseModel):
    id_rol: Optional[int] = None
    nombre: Optional[str] = None
    documento: Optional[str] = None
    correo: Optional[str] = None
    telefono: Optional[str] = None
    contrasena: Optional[str] = None
    estado: Optional[bool] = None

class UsuarioResponse(UsuarioBase):
    id_usuario: int
    fecha_registro: datetime
    model_config = ConfigDict(from_attributes=True)
