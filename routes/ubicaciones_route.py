from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config.database import get_db
from schemas.ubicaciones_schema import UbicacionCreate, UbicacionUpdate, UbicacionResponse
from controllers import ubicaciones_controller as controller

router = APIRouter(prefix="/api/ubicaciones", tags=["Ubicaciones"])

@router.get("/", response_model=List[UbicacionResponse])
def listar_ubicaciones(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return controller.listar(db, skip, limit)

@router.get("/{item_id}", response_model=UbicacionResponse)
def obtener_ubicaciones(item_id: int, db: Session = Depends(get_db)):
    return controller.obtener(db, item_id)

@router.post("/", response_model=UbicacionResponse, status_code=201)
def crear_ubicaciones(datos: UbicacionCreate, db: Session = Depends(get_db)):
    return controller.crear(db, datos)

@router.put("/{item_id}", response_model=UbicacionResponse)
def actualizar_ubicaciones(item_id: int, datos: UbicacionUpdate, db: Session = Depends(get_db)):
    return controller.actualizar(db, item_id, datos)

@router.delete("/{item_id}")
def eliminar_ubicaciones(item_id: int, db: Session = Depends(get_db)):
    return controller.eliminar(db, item_id)
