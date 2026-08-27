from typing import Optional
from datetime import date, datetime, time
from decimal import Decimal
from pydantic import BaseModel, ConfigDict

class PartidoBase(BaseModel):
    id_torneo: int
    id_equipo_local: int
    id_equipo_visitante: int
    fecha: date
    hora: time
    ronda: Optional[str] = None
    estado: str

class PartidoCreate(PartidoBase): pass
class PartidoUpdate(BaseModel):
    id_torneo: Optional[int] = None
    id_equipo_local: Optional[int] = None
    id_equipo_visitante: Optional[int] = None
    fecha: Optional[date] = None
    hora: Optional[time] = None
    ronda: Optional[str] = None
    estado: Optional[str] = None
class PartidoResponse(PartidoBase):
    id_partido: int
    model_config = ConfigDict(from_attributes=True)
