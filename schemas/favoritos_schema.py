from typing import Optional
from datetime import date, datetime, time
from decimal import Decimal
from pydantic import BaseModel, ConfigDict

class FavoritoBase(BaseModel):
    id_usuario: int
    id_cancha: int

class FavoritoCreate(FavoritoBase): pass
class FavoritoUpdate(BaseModel):
    id_usuario: Optional[int] = None
    id_cancha: Optional[int] = None
class FavoritoResponse(FavoritoBase):
    id_favorito: int
    fecha_agregado: datetime
    model_config = ConfigDict(from_attributes=True)
