from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config.database import get_db
from schemas.canchas_schema import CanchaCreate, CanchaUpdate, CanchaResponse
from controllers import canchas_controller as controller
from utils.dependencies import get_current_user, require_role
from models.modelos import Usuario

router = APIRouter(prefix="/api/canchas", tags=["Canchas"])

@router.get("/", response_model=List[CanchaResponse])
def listar_canchas(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return controller.listar(db, skip, limit)

@router.get("/{item_id}", response_model=CanchaResponse)
def obtener_canchas(item_id: int, db: Session = Depends(get_db)):
    return controller.obtener(db, item_id)

@router.post("/", response_model=CanchaResponse, status_code=201)
def crear_canchas(
    datos: CanchaCreate, 
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(require_role("Administrador", "Propietario"))
):
    return controller.crear(db, datos)

@router.put("/{item_id}", response_model=CanchaResponse)
def actualizar_canchas(
    item_id: int, 
    datos: CanchaUpdate, 
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(require_role("Administrador", "Propietario"))
):
    return controller.actualizar(db, item_id, datos)

@router.delete("/{item_id}")
def eliminar_canchas(
    item_id: int, 
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(require_role("Administrador", "Propietario"))
):
    return controller.eliminar(db, item_id)
from datetime import date

@router.get("/{item_id}/disponibilidad")
def consultar_disponibilidad(item_id: int, fecha: date, db: Session = Depends(get_db)):
    return controller.consultar_disponibilidad(db, item_id, fecha)
