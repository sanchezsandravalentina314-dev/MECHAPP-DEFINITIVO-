from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config.database import get_db
from schemas.reservas_schema import ReservaCreate, ReservaUpdate, ReservaResponse
from controllers import reservas_controller as controller
from utils.dependencies import get_current_user
from models.modelos import Usuario

router = APIRouter(prefix="/api/reservas", tags=["Reservas"])

@router.get("/", response_model=List[ReservaResponse])
def listar_reservas(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), usuario: Usuario = Depends(get_current_user)):
    return controller.listar(db, usuario, skip, limit)

@router.get("/{item_id}", response_model=ReservaResponse)
def obtener_reservas(item_id: int, db: Session = Depends(get_db), usuario: Usuario = Depends(get_current_user)):
    return controller.obtener(db, item_id, usuario)

@router.post("/", response_model=ReservaResponse, status_code=201)
def crear_reservas(datos: ReservaCreate, db: Session = Depends(get_db), usuario: Usuario = Depends(get_current_user)):
    return controller.crear(db, datos, usuario)

@router.put("/{item_id}", response_model=ReservaResponse)
def actualizar_reservas(item_id: int, datos: ReservaUpdate, db: Session = Depends(get_db), usuario: Usuario = Depends(get_current_user)):
    return controller.actualizar(db, item_id, datos, usuario)

@router.delete("/{item_id}")
def eliminar_reservas(item_id: int, db: Session = Depends(get_db), usuario: Usuario = Depends(get_current_user)):
    return controller.eliminar(db, item_id, usuario)
