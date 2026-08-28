from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from schemas.valoraciones_schema import ValoracionCreate, ValoracionUpdate
from services.valoraciones_service import valoraciones_service
from models.modelos import Valoracion

def listar(db: Session, skip: int = 0, limit: int = 100):
    return valoraciones_service.get_all(db, skip=skip, limit=limit)

def obtener(db: Session, item_id: int):
    obj = valoraciones_service.get_by_id(db, item_id)
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No encontrado.")
    return obj

def crear(db: Session, datos: ValoracionCreate):
    return valoraciones_service.create(db, datos.model_dump())

def actualizar(db: Session, item_id: int, datos: ValoracionUpdate):
    obj = valoraciones_service.update(db, item_id, datos.model_dump(exclude_unset=True))
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No encontrado.")
    return obj

def eliminar(db: Session, item_id: int):
    ok = valoraciones_service.delete(db, item_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No encontrado.")
    return {"mensaje": "Eliminado correctamente."}

def listar_por_cancha(db: Session, id_cancha: int):
    valoraciones = db.query(Valoracion).filter(Valoracion.id_cancha == id_cancha).all()
    if not valoraciones:
        return {"promedio": 0, "total": 0, "valoraciones": []}
        
    promedio = sum([v.puntuacion for v in valoraciones]) / len(valoraciones)
    
    return {
        "promedio": round(promedio, 1),
        "total": len(valoraciones),
        "valoraciones": [
            {
                "id_valoracion": v.id_valoracion,
                "id_usuario": v.id_usuario,
                "puntuacion": v.puntuacion,
                "comentario": v.comentario
            } for v in valoraciones
        ]
    }
