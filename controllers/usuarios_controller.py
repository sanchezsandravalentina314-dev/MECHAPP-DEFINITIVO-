from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from schemas.usuarios_schema import UsuarioCreate, UsuarioUpdate
from services.usuarios_service import usuarios_service

def listar(db: Session, skip: int = 0, limit: int = 100):
    return usuarios_service.get_all(db, skip=skip, limit=limit)

def obtener(db: Session, item_id: int):
    obj = usuarios_service.get_by_id(db, item_id)
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No encontrado.")
    return obj

def crear(db: Session, datos: UsuarioCreate):
    return usuarios_service.create(db, datos.model_dump())

def actualizar(db: Session, item_id: int, datos: UsuarioUpdate):
    obj = usuarios_service.update(db, item_id, datos.model_dump(exclude_unset=True))
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No encontrado.")
    return obj

def eliminar(db: Session, item_id: int):
    ok = usuarios_service.delete(db, item_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No encontrado.")
    return {"mensaje": "Eliminado correctamente."}
