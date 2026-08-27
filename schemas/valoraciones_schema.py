from typing import Optional
from datetime import date, datetime, time
from decimal import Decimal
from pydantic import BaseModel, ConfigDict

class ValoracionBase(BaseModel):
    id_usuario: int
    id_cancha: int
    puntuacion: int
    comentario: Optional[str] = None

class ValoracionCreate(ValoracionBase): pass
class ValoracionUpdate(BaseModel):
    id_usuario: Optional[int] = None
    id_cancha: Optional[int] = None
    puntuacion: Optional[int] = None
    comentario: Optional[str] = None
class ValoracionResponse(ValoracionBase):
    id_valoracion: int
    fecha: datetime
    model_config = ConfigDict(from_attributes=True)
