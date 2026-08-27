from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config.database import get_db
from schemas.equipo_jugador_schema import EquipoJugadorCreate, EquipoJugadorUpdate, EquipoJugadorResponse
from controllers import equipo_jugador_controller as controller

router = APIRouter(prefix="/api/equipo_jugador", tags=["Equipo Jugador"])

@router.get("/", response_model=List[EquipoJugadorResponse])
def listar_equipo_jugador(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return controller.listar(db, skip, limit)

@router.get("/{item_id}", response_model=EquipoJugadorResponse)
def obtener_equipo_jugador(item_id: int, db: Session = Depends(get_db)):
    return controller.obtener(db, item_id)

@router.post("/", response_model=EquipoJugadorResponse, status_code=201)
def crear_equipo_jugador(datos: EquipoJugadorCreate, db: Session = Depends(get_db)):
    return controller.crear(db, datos)

@router.put("/{item_id}", response_model=EquipoJugadorResponse)
def actualizar_equipo_jugador(item_id: int, datos: EquipoJugadorUpdate, db: Session = Depends(get_db)):
    return controller.actualizar(db, item_id, datos)

@router.delete("/{item_id}")
def eliminar_equipo_jugador(item_id: int, db: Session = Depends(get_db)):
    return controller.eliminar(db, item_id)
