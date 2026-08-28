from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config.database import get_db
from schemas.valoraciones_schema import ValoracionCreate, ValoracionUpdate, ValoracionResponse
from controllers import valoraciones_controller as controller
from utils.dependencies import get_current_user
from models.modelos import Usuario

router = APIRouter(prefix="/api/valoraciones", tags=["Valoraciones"])

@router.get("/cancha/{id_cancha}")
def listar_valoraciones_cancha(id_cancha: int, db: Session = Depends(get_db)):
    return controller.listar_por_cancha(db, id_cancha)

@router.get("/", response_model=List[ValoracionResponse])
def listar_valoraciones(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return controller.listar(db, skip, limit)

@router.get("/{item_id}", response_model=ValoracionResponse)
def obtener_valoraciones(item_id: int, db: Session = Depends(get_db)):
    return controller.obtener(db, item_id)

@router.post("/", response_model=ValoracionResponse, status_code=201)
def crear_valoraciones(datos: ValoracionCreate, db: Session = Depends(get_db), usuario: Usuario = Depends(get_current_user)):
    # Forzar que el usuario que califica sea el que está logueado
    datos.id_usuario = usuario.id_usuario
    return controller.crear(db, datos)

@router.put("/{item_id}", response_model=ValoracionResponse)
def actualizar_valoraciones(item_id: int, datos: ValoracionUpdate, db: Session = Depends(get_db), usuario: Usuario = Depends(get_current_user)):
    return controller.actualizar(db, item_id, datos)

@router.delete("/{item_id}")
def eliminar_valoraciones(item_id: int, db: Session = Depends(get_db), usuario: Usuario = Depends(get_current_user)):
    return controller.eliminar(db, item_id)
