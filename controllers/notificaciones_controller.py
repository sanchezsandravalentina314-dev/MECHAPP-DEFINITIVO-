from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from schemas.notificaciones_schema import NotificacionCreate, NotificacionUpdate
from services.notificaciones_service import notificaciones_service
from models.modelos import Usuario, Notificacion

def listar(db: Session, usuario: Usuario, skip: int = 0, limit: int = 100):
    return db.query(Notificacion).filter(
        Notificacion.id_usuario == usuario.id_usuario
    ).order_by(Notificacion.id_notificacion.desc()).offset(skip).limit(limit).all()

def marcar_leida(db: Session, item_id: int, usuario: Usuario):
    obj = notificaciones_service.get_by_id(db, item_id)
    if not obj or obj.id_usuario != usuario.id_usuario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No encontrado o acceso denegado.")
    obj.leida = True
    db.commit()
    db.refresh(obj)
    return obj

def crear(db: Session, datos: NotificacionCreate):
    return notificaciones_service.create(db, datos.model_dump())
