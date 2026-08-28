from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from schemas.reservas_schema import ReservaCreate, ReservaUpdate
from services.reservas_service import reservas_service
from models.modelos import Usuario, Rol, Cancha, Notificacion

def _check_ownership(db: Session, reserva, usuario: Usuario):
    rol = db.query(Rol).filter(Rol.id_rol == usuario.id_rol).first()
    if rol.nombre == "Jugador" and reserva.id_usuario != usuario.id_usuario:
        raise HTTPException(status_code=403, detail="No tienes permiso para acceder a esta reserva.")
    if rol.nombre == "Propietario":
        cancha = db.query(Cancha).filter(Cancha.id_cancha == reserva.id_cancha).first()
        if cancha and cancha.id_propietario != usuario.id_usuario:
            raise HTTPException(status_code=403, detail="No tienes permiso para acceder a reservas de esta cancha.")

def listar(db: Session, usuario: Usuario, skip: int = 0, limit: int = 100):
    rol = db.query(Rol).filter(Rol.id_rol == usuario.id_rol).first()
    if rol.nombre == "Jugador":
        from models.modelos import Reserva
        return db.query(Reserva).filter(Reserva.id_usuario == usuario.id_usuario).offset(skip).limit(limit).all()
    elif rol.nombre == "Propietario":
        from models.modelos import Reserva
        return db.query(Reserva).join(Cancha).filter(Cancha.id_propietario == usuario.id_usuario).offset(skip).limit(limit).all()
    return reservas_service.get_all(db, skip=skip, limit=limit)

def obtener(db: Session, item_id: int, usuario: Usuario):
    obj = reservas_service.get_by_id(db, item_id)
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No encontrado.")
    _check_ownership(db, obj, usuario)
    return obj

def crear(db: Session, datos: ReservaCreate, usuario: Usuario):
    data_dict = datos.model_dump()
    rol = db.query(Rol).filter(Rol.id_rol == usuario.id_rol).first()
    if rol.nombre == "Jugador":
        data_dict["id_usuario"] = usuario.id_usuario
        
    nueva_reserva = reservas_service.create(db, data_dict)
    
    # HU72: Generar notificacin automtica
    cancha = db.query(Cancha).filter(Cancha.id_cancha == nueva_reserva.id_cancha).first()
    nombre_cancha = cancha.nombre if cancha else "una cancha"
    
    noti = Notificacion(
        id_usuario=nueva_reserva.id_usuario,
        mensaje=f"Tu reserva en {nombre_cancha} para el {nueva_reserva.fecha} ha sido creada con estado: {nueva_reserva.estado}.",
        leida=False
    )
    db.add(noti)
    db.commit()
    
    return nueva_reserva

def actualizar(db: Session, item_id: int, datos: ReservaUpdate, usuario: Usuario):
    obj = reservas_service.get_by_id(db, item_id)
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No encontrado.")
    _check_ownership(db, obj, usuario)
    
    # Check if estado is changing
    old_estado = obj.estado
    updated_obj = reservas_service.update(db, item_id, datos.model_dump(exclude_unset=True))
    
    if old_estado != updated_obj.estado:
        noti = Notificacion(
            id_usuario=updated_obj.id_usuario,
            mensaje=f"El estado de tu reserva #{updated_obj.id_reserva} cambi a: {updated_obj.estado}.",
            leida=False
        )
        db.add(noti)
        db.commit()
        
    return updated_obj

def eliminar(db: Session, item_id: int, usuario: Usuario):
    obj = reservas_service.get_by_id(db, item_id)
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No encontrado.")
    _check_ownership(db, obj, usuario)
    reservas_service.delete(db, item_id)
    return {"mensaje": "Eliminado correctamente."}
