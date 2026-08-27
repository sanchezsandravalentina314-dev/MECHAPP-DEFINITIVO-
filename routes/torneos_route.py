from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config.database import get_db
from schemas.torneos_schema import TorneoCreate, TorneoUpdate, TorneoResponse
from controllers import torneos_controller as controller

router = APIRouter(prefix="/api/torneos", tags=["Torneos"])

@router.get("/", response_model=List[TorneoResponse])
def listar_torneos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return controller.listar(db, skip, limit)

@router.get("/{item_id}", response_model=TorneoResponse)
def obtener_torneos(item_id: int, db: Session = Depends(get_db)):
    return controller.obtener(db, item_id)

@router.post("/", response_model=TorneoResponse, status_code=201)
def crear_torneos(datos: TorneoCreate, db: Session = Depends(get_db)):
    return controller.crear(db, datos)

@router.put("/{item_id}", response_model=TorneoResponse)
def actualizar_torneos(item_id: int, datos: TorneoUpdate, db: Session = Depends(get_db)):
    return controller.actualizar(db, item_id, datos)

@router.delete("/{item_id}")
def eliminar_torneos(item_id: int, db: Session = Depends(get_db)):
    return controller.eliminar(db, item_id)
