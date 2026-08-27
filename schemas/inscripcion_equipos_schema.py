from typing import Optional
from datetime import date, datetime, time
from decimal import Decimal
from pydantic import BaseModel, ConfigDict

class InscripcionEquipoBase(BaseModel):
    id_equipo: int
    id_torneo: int
    estado: str

class InscripcionEquipoCreate(InscripcionEquipoBase): pass
class InscripcionEquipoUpdate(BaseModel):
    id_equipo: Optional[int] = None
    id_torneo: Optional[int] = None
    estado: Optional[str] = None
class InscripcionEquipoResponse(InscripcionEquipoBase):
    id_inscripcion_equipo: int
    fecha_inscripcion: datetime
    model_config = ConfigDict(from_attributes=True)
