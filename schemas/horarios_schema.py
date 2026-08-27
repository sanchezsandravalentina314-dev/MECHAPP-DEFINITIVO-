from typing import Optional
from datetime import date, datetime, time
from decimal import Decimal
from pydantic import BaseModel, ConfigDict

class HorarioBase(BaseModel):
    id_cancha: int
    fecha: date
    hora_inicio: time
    hora_fin: time
    estado: bool = True

class HorarioCreate(HorarioBase): pass
class HorarioUpdate(BaseModel):
    id_cancha: Optional[int] = None
    fecha: Optional[date] = None
    hora_inicio: Optional[time] = None
    hora_fin: Optional[time] = None
    estado: Optional[bool] = None
class HorarioResponse(HorarioBase):
    id_horario: int
    model_config = ConfigDict(from_attributes=True)
