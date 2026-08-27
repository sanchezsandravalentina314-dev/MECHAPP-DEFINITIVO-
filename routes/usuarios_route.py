from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config.database import get_db
from schemas.usuarios_schema import UsuarioCreate, UsuarioUpdate, UsuarioResponse
from controllers import usuarios_controller as controller

router = APIRouter(prefix="/api/usuarios", tags=["Usuarios"])

@router.get("/", response_model=List[UsuarioResponse])
def listar_usuarios(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return controller.listar(db, skip, limit)

@router.get("/{item_id}", response_model=UsuarioResponse)
def obtener_usuarios(item_id: int, db: Session = Depends(get_db)):
    return controller.obtener(db, item_id)

@router.post("/", response_model=UsuarioResponse, status_code=201)
def crear_usuarios(datos: UsuarioCreate, db: Session = Depends(get_db)):
    return controller.crear(db, datos)

@router.put("/{item_id}", response_model=UsuarioResponse)
def actualizar_usuarios(item_id: int, datos: UsuarioUpdate, db: Session = Depends(get_db)):
    return controller.actualizar(db, item_id, datos)

@router.delete("/{item_id}")
def eliminar_usuarios(item_id: int, db: Session = Depends(get_db)):
    return controller.eliminar(db, item_id)
