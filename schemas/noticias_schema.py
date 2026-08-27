"""
Esquemas Pydantic para el módulo de noticias.
"""
from typing import Optional
from pydantic import BaseModel


class NoticiaBase(BaseModel):
    titulo: str
    contenido: str
    autor_id: Optional[int] = None
    imagen_url: Optional[str] = None


class NoticiaCreate(NoticiaBase):
    pass


class NoticiaUpdate(BaseModel):
    titulo: Optional[str] = None
    contenido: Optional[str] = None
    autor_id: Optional[int] = None
    imagen_url: Optional[str] = None


class NoticiaResponse(NoticiaBase):
    id: int

    class Config:
        from_attributes = True
