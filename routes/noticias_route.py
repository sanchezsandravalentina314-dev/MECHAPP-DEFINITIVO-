"""
Rutas HTTP del módulo de noticias.
"""
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from config.database import get_db
from schemas.noticias_schema import NoticiaCreate, NoticiaUpdate, NoticiaResponse
from controllers import noticias_controller as controller

router = APIRouter(prefix="/api/noticias", tags=["Noticias"])


@router.get("/", response_model=List[NoticiaResponse])
def listar_noticias(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return controller.listar(db, skip, limit)


@router.get("/{item_id}", response_model=NoticiaResponse)
def obtener_noticias(item_id: int, db: Session = Depends(get_db)):
    return controller.obtener(db, item_id)


@router.post("/", response_model=NoticiaResponse, status_code=201)
def crear_noticias(datos: NoticiaCreate, db: Session = Depends(get_db)):
    return controller.crear(db, datos)


@router.put("/{item_id}", response_model=NoticiaResponse)
def actualizar_noticias(item_id: int, datos: NoticiaUpdate, db: Session = Depends(get_db)):
    return controller.actualizar(db, item_id, datos)


@router.delete("/{item_id}")
def eliminar_noticias(item_id: int, db: Session = Depends(get_db)):
    return controller.eliminar(db, item_id)
