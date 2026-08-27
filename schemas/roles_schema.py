from typing import Optional
from datetime import date, datetime, time
from decimal import Decimal
from pydantic import BaseModel, ConfigDict

class RolBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    estado: bool = True

class RolCreate(RolBase): pass
class RolUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    estado: Optional[bool] = None
class RolResponse(RolBase):
    id_rol: int
    model_config = ConfigDict(from_attributes=True)
