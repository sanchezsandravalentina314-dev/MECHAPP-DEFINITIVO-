"""
Esquemas Pydantic para el módulo de eventos.
"""
from typing import Optional
from datetime import date, time
from pydantic import BaseModel


class EventoBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    cancha_id: Optional[int] = None
    fecha: Optional[date] = None
    hora: Optional[time] = None
    tipo: Optional[str] = None


class EventoCreate(EventoBase):
    pass


class EventoUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    cancha_id: Optional[int] = None
    fecha: Optional[date] = None
    hora: Optional[time] = None
    tipo: Optional[str] = None


class EventoResponse(EventoBase):
    id: int

    class Config:
        from_attributes = True
