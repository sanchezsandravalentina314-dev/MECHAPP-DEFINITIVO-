from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config.database import get_db
from schemas.partidas_schema import PartidoCreate, PartidoUpdate, PartidoResponse
from controllers import partidas_controller as controller

router = APIRouter(prefix="/api/partidas", tags=["Partidas"])

@router.get("/", response_model=List[PartidoResponse])
def listar_partidas(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return controller.listar(db, skip, limit)

@router.get("/{item_id}", response_model=PartidoResponse)
def obtener_partidas(item_id: int, db: Session = Depends(get_db)):
    return controller.obtener(db, item_id)

@router.post("/", response_model=PartidoResponse, status_code=201)
def crear_partidas(datos: PartidoCreate, db: Session = Depends(get_db)):
    return controller.crear(db, datos)

@router.put("/{item_id}", response_model=PartidoResponse)
def actualizar_partidas(item_id: int, datos: PartidoUpdate, db: Session = Depends(get_db)):
    return controller.actualizar(db, item_id, datos)

@router.delete("/{item_id}")
def eliminar_partidas(item_id: int, db: Session = Depends(get_db)):
    return controller.eliminar(db, item_id)
