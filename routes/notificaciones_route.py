from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config.database import get_db
from schemas.notificaciones_schema import NotificacionCreate, NotificacionUpdate, NotificacionResponse
from controllers import notificaciones_controller as controller

router = APIRouter(prefix="/api/notificaciones", tags=["Notificaciones"])

@router.get("/", response_model=List[NotificacionResponse])
def listar_notificaciones(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return controller.listar(db, skip, limit)

@router.get("/{item_id}", response_model=NotificacionResponse)
def obtener_notificaciones(item_id: int, db: Session = Depends(get_db)):
    return controller.obtener(db, item_id)

@router.post("/", response_model=NotificacionResponse, status_code=201)
def crear_notificaciones(datos: NotificacionCreate, db: Session = Depends(get_db)):
    return controller.crear(db, datos)

@router.put("/{item_id}", response_model=NotificacionResponse)
def actualizar_notificaciones(item_id: int, datos: NotificacionUpdate, db: Session = Depends(get_db)):
    return controller.actualizar(db, item_id, datos)

@router.delete("/{item_id}")
def eliminar_notificaciones(item_id: int, db: Session = Depends(get_db)):
    return controller.eliminar(db, item_id)
