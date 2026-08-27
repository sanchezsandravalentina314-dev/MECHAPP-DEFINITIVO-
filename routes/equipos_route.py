from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config.database import get_db
from schemas.equipos_schema import EquipoCreate, EquipoUpdate, EquipoResponse
from controllers import equipos_controller as controller

router = APIRouter(prefix="/api/equipos", tags=["Equipos"])

@router.get("/", response_model=List[EquipoResponse])
def listar_equipos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return controller.listar(db, skip, limit)

@router.get("/{item_id}", response_model=EquipoResponse)
def obtener_equipos(item_id: int, db: Session = Depends(get_db)):
    return controller.obtener(db, item_id)

@router.post("/", response_model=EquipoResponse, status_code=201)
def crear_equipos(datos: EquipoCreate, db: Session = Depends(get_db)):
    return controller.crear(db, datos)

@router.put("/{item_id}", response_model=EquipoResponse)
def actualizar_equipos(item_id: int, datos: EquipoUpdate, db: Session = Depends(get_db)):
    return controller.actualizar(db, item_id, datos)

@router.delete("/{item_id}")
def eliminar_equipos(item_id: int, db: Session = Depends(get_db)):
    return controller.eliminar(db, item_id)
