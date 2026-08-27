from typing import Optional
from datetime import date, datetime, time
from decimal import Decimal
from pydantic import BaseModel, ConfigDict

class EquipoBase(BaseModel):
    id_capitan: int
    nombre: str
    descripcion: Optional[str] = None
    estado: bool = True

class EquipoCreate(EquipoBase): pass
class EquipoUpdate(BaseModel):
    id_capitan: Optional[int] = None
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    estado: Optional[bool] = None
class EquipoResponse(EquipoBase):
    id_equipo: int
    fecha_creacion: datetime
    model_config = ConfigDict(from_attributes=True)
