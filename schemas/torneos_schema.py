from typing import Optional
from datetime import date, datetime, time
from decimal import Decimal
from pydantic import BaseModel, ConfigDict

class TorneoBase(BaseModel):
    id_cancha: int
    nombre: str
    descripcion: Optional[str] = None
    fecha_inicio: date
    fecha_fin: date
    premio: Optional[Decimal] = None
    estado: str
    cupo_maximo: Optional[int] = None

class TorneoCreate(TorneoBase): pass
class TorneoUpdate(BaseModel):
    id_cancha: Optional[int] = None
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    fecha_inicio: Optional[date] = None
    fecha_fin: Optional[date] = None
    premio: Optional[Decimal] = None
    estado: Optional[str] = None
    cupo_maximo: Optional[int] = None
class TorneoResponse(TorneoBase):
    id_torneo: int
    model_config = ConfigDict(from_attributes=True)
