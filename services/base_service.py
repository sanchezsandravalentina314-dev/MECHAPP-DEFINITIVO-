"""
CRUD genérico. Obtiene automáticamente la clave primaria del modelo,
por lo que funciona con id, id_usuario, id_cancha, etc.
"""
from typing import Type, TypeVar, Generic, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy.inspection import inspect

ModelType = TypeVar("ModelType")

class BaseCRUDService(Generic[ModelType]):
    def __init__(self, model: Type[ModelType]):
        self.model = model

    def _pk_column(self):
        return inspect(self.model).primary_key[0]

    def get_all(self, db: Session, skip: int = 0, limit: int = 100) -> List[ModelType]:
        return db.query(self.model).offset(skip).limit(limit).all()

    def get_by_id(self, db: Session, item_id: int) -> Optional[ModelType]:
        return db.query(self.model).filter(self._pk_column() == item_id).first()

    def create(self, db: Session, data: dict) -> ModelType:
        obj = self.model(**data)
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj

    def update(self, db: Session, item_id: int, data: dict) -> Optional[ModelType]:
        obj = self.get_by_id(db, item_id)
        if not obj:
            return None
        for key, value in data.items():
            if value is not None and hasattr(obj, key):
                setattr(obj, key, value)
        db.commit()
        db.refresh(obj)
        return obj

    def delete(self, db: Session, item_id: int) -> bool:
        obj = self.get_by_id(db, item_id)
        if not obj:
            return False
        db.delete(obj)
        db.commit()
        return True
