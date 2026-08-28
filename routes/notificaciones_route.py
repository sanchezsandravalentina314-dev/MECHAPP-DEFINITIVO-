from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config.database import get_db
from schemas.notificaciones_schema import NotificacionCreate, NotificacionUpdate, NotificacionResponse
from controllers import notificaciones_controller as controller
from utils.dependencies import get_current_user
from models.modelos import Usuario

router = APIRouter(prefix="/api/notificaciones", tags=["Notificaciones"])

@router.get("/", response_model=List[NotificacionResponse])
def listar_notificaciones(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    return controller.listar(db, usuario, skip, limit)

@router.put("/{item_id}/marcar-leida", response_model=NotificacionResponse)
def marcar_leida(item_id: int, db: Session = Depends(get_db), usuario: Usuario = Depends(get_current_user)):
    return controller.marcar_leida(db, item_id, usuario)

@router.post("/", response_model=NotificacionResponse, status_code=201)
def crear_notificaciones(datos: NotificacionCreate, db: Session = Depends(get_db)):
    return controller.crear(db, datos)
