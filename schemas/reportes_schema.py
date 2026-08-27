"""
Esquemas Pydantic para el módulo de reportes.
"""
from typing import Optional
from pydantic import BaseModel


class ReporteBase(BaseModel):
    usuario_id: int
    tipo: Optional[str] = None
    descripcion: str
    estado: Optional[str] = None


class ReporteCreate(ReporteBase):
    pass


class ReporteUpdate(BaseModel):
    usuario_id: Optional[int] = None
    tipo: Optional[str] = None
    descripcion: Optional[str] = None
    estado: Optional[str] = None


class ReporteResponse(ReporteBase):
    id: int

    class Config:
        from_attributes = True
