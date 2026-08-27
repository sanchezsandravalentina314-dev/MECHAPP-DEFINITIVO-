from typing import Optional
from datetime import date, datetime, time
from decimal import Decimal
from pydantic import BaseModel, ConfigDict

class CanchaBase(BaseModel):
    id_usuario: int
    id_ubicacion: int
    nombre: str
    descripcion: Optional[str] = None
    capacidad: Optional[int] = None
    estado: bool = True
    precio_hora: Optional[Decimal] = None

class CanchaCreate(CanchaBase): pass
class CanchaUpdate(BaseModel):
    id_usuario: Optional[int] = None
    id_ubicacion: Optional[int] = None
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    capacidad: Optional[int] = None
    estado: Optional[bool] = None
    precio_hora: Optional[Decimal] = None
class CanchaResponse(CanchaBase):
    id_cancha: int
    model_config = ConfigDict(from_attributes=True)
