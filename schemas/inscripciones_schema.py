from typing import Optional
from datetime import date, datetime, time
from decimal import Decimal
from pydantic import BaseModel, ConfigDict

class InscripcionBase(BaseModel):
    id_usuario: int
    id_torneo: int
    estado: str

class InscripcionCreate(InscripcionBase): pass
class InscripcionUpdate(BaseModel):
    id_usuario: Optional[int] = None
    id_torneo: Optional[int] = None
    estado: Optional[str] = None
class InscripcionResponse(InscripcionBase):
    id_inscripcion: int
    fecha_inscripcion: datetime
    model_config = ConfigDict(from_attributes=True)
