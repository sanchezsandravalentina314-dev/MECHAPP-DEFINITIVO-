from typing import Optional
from datetime import date, datetime, time
from decimal import Decimal
from pydantic import BaseModel, ConfigDict

class EquipoJugadorBase(BaseModel):
    id_equipo: int
    id_usuario: int
    fecha_ingreso: date
    estado: bool = True

class EquipoJugadorCreate(EquipoJugadorBase): pass
class EquipoJugadorUpdate(BaseModel):
    id_equipo: Optional[int] = None
    id_usuario: Optional[int] = None
    fecha_ingreso: Optional[date] = None
    estado: Optional[bool] = None
class EquipoJugadorResponse(EquipoJugadorBase):
    id_equipo_jugador: int
    model_config = ConfigDict(from_attributes=True)
