from fastapi import HTTPException
from sqlalchemy.orm import Session
from services.base_service import BaseCRUDService
from models.modelos import Equipo, EquipoJugador

class EquiposService(BaseCRUDService):
    def __init__(self):
        super().__init__(Equipo)

    def create(self, db: Session, data: dict):
        id_capitan = data.get("id_capitan")
        
        # 1. Crear el equipo (por defecto activo)
        if "estado" not in data:
            data["estado"] = "Activo"
            
        nuevo_equipo = super().create(db, data)

        # 2. HU50: Asignar automáticamente al creador (capitán) como el primer jugador del equipo
        if id_capitan:
            jugador_capitan = EquipoJugador(
                id_equipo=nuevo_equipo.id_equipo,
                id_usuario=id_capitan
            )
            db.add(jugador_capitan)
            db.commit()

        return nuevo_equipo

equipos_service = EquiposService()
