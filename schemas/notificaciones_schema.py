from typing import Optional
from datetime import date, datetime, time
from decimal import Decimal
from pydantic import BaseModel, ConfigDict

class NotificacionBase(BaseModel):
    id_usuario: int
    titulo: str
    mensaje: str
    leida: bool = False

class NotificacionCreate(NotificacionBase): pass
class NotificacionUpdate(BaseModel):
    id_usuario: Optional[int] = None
    titulo: Optional[str] = None
    mensaje: Optional[str] = None
    leida: Optional[bool] = None
class NotificacionResponse(NotificacionBase):
    id_notificacion: int
    fecha: datetime
    model_config = ConfigDict(from_attributes=True)
