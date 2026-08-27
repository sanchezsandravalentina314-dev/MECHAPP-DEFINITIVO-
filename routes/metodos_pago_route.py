from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config.database import get_db
from schemas.metodos_pago_schema import MetodoPagoCreate, MetodoPagoUpdate, MetodoPagoResponse
from controllers import metodos_pago_controller as controller

router = APIRouter(prefix="/api/metodos_pago", tags=["Metodos Pago"])

@router.get("/", response_model=List[MetodoPagoResponse])
def listar_metodos_pago(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return controller.listar(db, skip, limit)

@router.get("/{item_id}", response_model=MetodoPagoResponse)
def obtener_metodos_pago(item_id: int, db: Session = Depends(get_db)):
    return controller.obtener(db, item_id)

@router.post("/", response_model=MetodoPagoResponse, status_code=201)
def crear_metodos_pago(datos: MetodoPagoCreate, db: Session = Depends(get_db)):
    return controller.crear(db, datos)

@router.put("/{item_id}", response_model=MetodoPagoResponse)
def actualizar_metodos_pago(item_id: int, datos: MetodoPagoUpdate, db: Session = Depends(get_db)):
    return controller.actualizar(db, item_id, datos)

@router.delete("/{item_id}")
def eliminar_metodos_pago(item_id: int, db: Session = Depends(get_db)):
    return controller.eliminar(db, item_id)
