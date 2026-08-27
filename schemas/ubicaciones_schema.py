from typing import Optional
from datetime import date, datetime, time
from decimal import Decimal
from pydantic import BaseModel, ConfigDict

class UbicacionBase(BaseModel):
    nombre: str
    direccion: str
    ciudad: str
    barrio: Optional[str] = None
    estado: bool = True

class UbicacionCreate(UbicacionBase): pass
class UbicacionUpdate(BaseModel):
    nombre: Optional[str] = None
    direccion: Optional[str] = None
    ciudad: Optional[str] = None
    barrio: Optional[str] = None
    estado: Optional[bool] = None
class UbicacionResponse(UbicacionBase):
    id_ubicacion: int
    model_config = ConfigDict(from_attributes=True)
