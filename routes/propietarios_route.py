"""
Rutas HTTP del módulo de propietarios.
"""
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from config.database import get_db
from schemas.propietarios_schema import PropietarioCreate, PropietarioUpdate, PropietarioResponse
from controllers import propietarios_controller as controller

router = APIRouter(prefix="/api/propietarios", tags=["Propietarios"])


@router.get("/", response_model=List[PropietarioResponse])
def listar_propietarios(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return controller.listar(db, skip, limit)


@router.get("/{item_id}", response_model=PropietarioResponse)
def obtener_propietarios(item_id: int, db: Session = Depends(get_db)):
    return controller.obtener(db, item_id)


@router.post("/", response_model=PropietarioResponse, status_code=201)
def crear_propietarios(datos: PropietarioCreate, db: Session = Depends(get_db)):
    return controller.crear(db, datos)


@router.put("/{item_id}", response_model=PropietarioResponse)
def actualizar_propietarios(item_id: int, datos: PropietarioUpdate, db: Session = Depends(get_db)):
    return controller.actualizar(db, item_id, datos)


@router.delete("/{item_id}")
def eliminar_propietarios(item_id: int, db: Session = Depends(get_db)):
    return controller.eliminar(db, item_id)
