from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from schemas.canchas_schema import CanchaCreate, CanchaUpdate
from services.canchas_service import canchas_service
from models.modelos import Reserva

def listar(db: Session, skip: int = 0, limit: int = 100):
    return canchas_service.get_all(db, skip=skip, limit=limit)

def obtener(db: Session, item_id: int):
    obj = canchas_service.get_by_id(db, item_id)
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No encontrado.")
    return obj

def crear(db: Session, datos: CanchaCreate):
    return canchas_service.create(db, datos.model_dump())

def actualizar(db: Session, item_id: int, datos: CanchaUpdate):
    obj = canchas_service.update(db, item_id, datos.model_dump(exclude_unset=True))
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No encontrado.")
    return obj

def eliminar(db: Session, item_id: int):
    ok = canchas_service.delete(db, item_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No encontrado.")
    return {"mensaje": "Eliminado correctamente."}

def consultar_disponibilidad(db: Session, item_id: int, fecha):
    # Obtener todas las reservas de esa cancha en esa fecha
    reservas = db.query(Reserva).filter(
        Reserva.id_cancha == item_id,
        Reserva.fecha == fecha,
        Reserva.estado != 'Cancelada'
    ).all()
    
    # Formatear la salida para el frontend
    ocupados = [{"hora_inicio": str(r.hora_inicio), "hora_fin": str(r.hora_fin)} for r in reservas]
    return {
        "cancha_id": item_id,
        "fecha": str(fecha),
        "horarios_ocupados": ocupados,
        "mensaje": "Estas son las franjas horarias que ya estn reservadas."
    }
