from typing import Optional
from datetime import date, datetime, time
from decimal import Decimal
from pydantic import BaseModel, ConfigDict

class ReservaBase(BaseModel):
    id_usuario: int
    id_cancha: int
    fecha: date
    hora_inicio: time
    hora_fin: time
    valor: Decimal
    estado: str

class ReservaCreate(ReservaBase): pass
class ReservaUpdate(BaseModel):
    id_usuario: Optional[int] = None
    id_cancha: Optional[int] = None
    fecha: Optional[date] = None
    hora_inicio: Optional[time] = None
    hora_fin: Optional[time] = None
    valor: Optional[Decimal] = None
    estado: Optional[str] = None
class ReservaResponse(ReservaBase):
    id_reserva: int
    fecha_reserva: datetime
    model_config = ConfigDict(from_attributes=True)
