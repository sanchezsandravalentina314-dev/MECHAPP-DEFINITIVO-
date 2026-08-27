from typing import Optional
from datetime import date, datetime, time
from decimal import Decimal
from pydantic import BaseModel, ConfigDict

class ResultadoBase(BaseModel):
    id_partido: int
    id_equipo_ganador: Optional[int] = None
    puntos_local: int
    puntos_visitante: int
    observaciones: Optional[str] = None

class ResultadoCreate(ResultadoBase): pass
class ResultadoUpdate(BaseModel):
    id_partido: Optional[int] = None
    id_equipo_ganador: Optional[int] = None
    puntos_local: Optional[int] = None
    puntos_visitante: Optional[int] = None
    observaciones: Optional[str] = None
class ResultadoResponse(ResultadoBase):
    id_resultado: int
    model_config = ConfigDict(from_attributes=True)
