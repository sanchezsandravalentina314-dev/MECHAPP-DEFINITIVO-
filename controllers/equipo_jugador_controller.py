from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from schemas.equipo_jugador_schema import EquipoJugadorCreate, EquipoJugadorUpdate
from services.equipo_jugador_service import equipo_jugador_service

def listar(db: Session, skip: int = 0, limit: int = 100):
    return equipo_jugador_service.get_all(db, skip=skip, limit=limit)

def obtener(db: Session, item_id: int):
    obj = equipo_jugador_service.get_by_id(db, item_id)
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No encontrado.")
    return obj

def crear(db: Session, datos: EquipoJugadorCreate):
    return equipo_jugador_service.create(db, datos.model_dump())

def actualizar(db: Session, item_id: int, datos: EquipoJugadorUpdate):
    obj = equipo_jugador_service.update(db, item_id, datos.model_dump(exclude_unset=True))
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No encontrado.")
    return obj

def eliminar(db: Session, item_id: int):
    ok = equipo_jugador_service.delete(db, item_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No encontrado.")
    return {"mensaje": "Eliminado correctamente."}
