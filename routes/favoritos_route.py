from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config.database import get_db
from schemas.favoritos_schema import FavoritoCreate, FavoritoUpdate, FavoritoResponse
from controllers import favoritos_controller as controller

router = APIRouter(prefix="/api/favoritos", tags=["Favoritos"])

@router.get("/", response_model=List[FavoritoResponse])
def listar_favoritos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return controller.listar(db, skip, limit)

@router.get("/{item_id}", response_model=FavoritoResponse)
def obtener_favoritos(item_id: int, db: Session = Depends(get_db)):
    return controller.obtener(db, item_id)

@router.post("/", response_model=FavoritoResponse, status_code=201)
def crear_favoritos(datos: FavoritoCreate, db: Session = Depends(get_db)):
    return controller.crear(db, datos)

@router.put("/{item_id}", response_model=FavoritoResponse)
def actualizar_favoritos(item_id: int, datos: FavoritoUpdate, db: Session = Depends(get_db)):
    return controller.actualizar(db, item_id, datos)

@router.delete("/{item_id}")
def eliminar_favoritos(item_id: int, db: Session = Depends(get_db)):
    return controller.eliminar(db, item_id)
