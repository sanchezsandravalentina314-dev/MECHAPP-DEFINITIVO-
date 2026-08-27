from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config.database import get_db
from schemas.roles_schema import RolCreate, RolUpdate, RolResponse
from controllers import roles_controller as controller

router = APIRouter(prefix="/api/roles", tags=["Roles"])

@router.get("/", response_model=List[RolResponse])
def listar_roles(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return controller.listar(db, skip, limit)

@router.get("/{item_id}", response_model=RolResponse)
def obtener_roles(item_id: int, db: Session = Depends(get_db)):
    return controller.obtener(db, item_id)

@router.post("/", response_model=RolResponse, status_code=201)
def crear_roles(datos: RolCreate, db: Session = Depends(get_db)):
    return controller.crear(db, datos)

@router.put("/{item_id}", response_model=RolResponse)
def actualizar_roles(item_id: int, datos: RolUpdate, db: Session = Depends(get_db)):
    return controller.actualizar(db, item_id, datos)

@router.delete("/{item_id}")
def eliminar_roles(item_id: int, db: Session = Depends(get_db)):
    return controller.eliminar(db, item_id)
