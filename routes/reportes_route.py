"""
Rutas HTTP del módulo de reportes.
"""
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from config.database import get_db
from schemas.reportes_schema import ReporteCreate, ReporteUpdate, ReporteResponse
from controllers import reportes_controller as controller

router = APIRouter(prefix="/api/reportes", tags=["Reportes"])


@router.get("/", response_model=List[ReporteResponse])
def listar_reportes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return controller.listar(db, skip, limit)


@router.get("/{item_id}", response_model=ReporteResponse)
def obtener_reportes(item_id: int, db: Session = Depends(get_db)):
    return controller.obtener(db, item_id)


@router.post("/", response_model=ReporteResponse, status_code=201)
def crear_reportes(datos: ReporteCreate, db: Session = Depends(get_db)):
    return controller.crear(db, datos)


@router.put("/{item_id}", response_model=ReporteResponse)
def actualizar_reportes(item_id: int, datos: ReporteUpdate, db: Session = Depends(get_db)):
    return controller.actualizar(db, item_id, datos)


@router.delete("/{item_id}")
def eliminar_reportes(item_id: int, db: Session = Depends(get_db)):
    return controller.eliminar(db, item_id)
