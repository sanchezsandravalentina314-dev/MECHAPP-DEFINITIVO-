"""
Controlador del módulo de reportes: valida y delega en el servicio.
"""
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from schemas.reportes_schema import ReporteCreate, ReporteUpdate
from services.reportes_service import reportes_service


def listar(db: Session, skip: int = 0, limit: int = 100):
    return reportes_service.get_all(db, skip=skip, limit=limit)


def obtener(db: Session, item_id: int):
    obj = reportes_service.get_by_id(db, item_id)
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No encontrado.")
    return obj


def crear(db: Session, datos: ReporteCreate):
    return reportes_service.create(db, datos.model_dump())


def actualizar(db: Session, item_id: int, datos: ReporteUpdate):
    obj = reportes_service.update(db, item_id, datos.model_dump(exclude_unset=True))
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No encontrado.")
    return obj


def eliminar(db: Session, item_id: int):
    ok = reportes_service.delete(db, item_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No encontrado.")
    return {"mensaje": "Eliminado correctamente."}
