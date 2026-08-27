from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config.database import get_db
from schemas.horarios_schema import HorarioCreate, HorarioUpdate, HorarioResponse
from controllers import horarios_controller as controller

router = APIRouter(prefix="/api/horarios", tags=["Horarios"])

@router.get("/", response_model=List[HorarioResponse])
def listar_horarios(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return controller.listar(db, skip, limit)

@router.get("/{item_id}", response_model=HorarioResponse)
def obtener_horarios(item_id: int, db: Session = Depends(get_db)):
    return controller.obtener(db, item_id)

@router.post("/", response_model=HorarioResponse, status_code=201)
def crear_horarios(datos: HorarioCreate, db: Session = Depends(get_db)):
    return controller.crear(db, datos)

@router.put("/{item_id}", response_model=HorarioResponse)
def actualizar_horarios(item_id: int, datos: HorarioUpdate, db: Session = Depends(get_db)):
    return controller.actualizar(db, item_id, datos)

@router.delete("/{item_id}")
def eliminar_horarios(item_id: int, db: Session = Depends(get_db)):
    return controller.eliminar(db, item_id)
