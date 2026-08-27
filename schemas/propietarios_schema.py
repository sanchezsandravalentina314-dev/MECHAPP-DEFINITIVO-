"""
Esquemas Pydantic para el módulo de propietarios.
"""
from typing import Optional
from pydantic import BaseModel


class PropietarioBase(BaseModel):
    usuario_id: int
    empresa: Optional[str] = None
    nit: Optional[str] = None
    telefono_contacto: Optional[str] = None


class PropietarioCreate(PropietarioBase):
    pass


class PropietarioUpdate(BaseModel):
    usuario_id: Optional[int] = None
    empresa: Optional[str] = None
    nit: Optional[str] = None
    telefono_contacto: Optional[str] = None


class PropietarioResponse(PropietarioBase):
    id: int

    class Config:
        from_attributes = True
