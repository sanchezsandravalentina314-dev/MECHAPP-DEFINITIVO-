from typing import Optional
from datetime import date, datetime, time
from decimal import Decimal
from pydantic import BaseModel, ConfigDict

class PagoBase(BaseModel):
    id_metodo_pago: int
    id_reserva: Optional[int] = None
    id_inscripcion: Optional[int] = None
    valor: Decimal
    estado: str
    referencia: Optional[str] = None

class PagoCreate(PagoBase): pass
class PagoUpdate(BaseModel):
    id_metodo_pago: Optional[int] = None
    id_reserva: Optional[int] = None
    id_inscripcion: Optional[int] = None
    valor: Optional[Decimal] = None
    estado: Optional[str] = None
    referencia: Optional[str] = None
class PagoResponse(PagoBase):
    id_pago: int
    fecha_pago: datetime
    model_config = ConfigDict(from_attributes=True)
