from typing import Optional
from datetime import date, datetime, time
from decimal import Decimal
from pydantic import BaseModel, ConfigDict

class MetodoPagoBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    estado: bool = True

class MetodoPagoCreate(MetodoPagoBase): pass
class MetodoPagoUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    estado: Optional[bool] = None
class MetodoPagoResponse(MetodoPagoBase):
    id_metodo_pago: int
    model_config = ConfigDict(from_attributes=True)
