from fastapi import HTTPException
from sqlalchemy.orm import Session
from services.base_service import BaseCRUDService
from models.modelos import EquipoJugador, Equipo

class EquipoJugadorService(BaseCRUDService):
    def __init__(self):
        super().__init__(EquipoJugador)

    def create(self, db: Session, data: dict):
        id_equipo = data.get("id_equipo")
        id_usuario = data.get("id_usuario")

        # 1. Validar que el equipo exista y esté activo
        equipo = db.query(Equipo).filter(Equipo.id_equipo == id_equipo).first()
        if not equipo:
            raise HTTPException(status_code=404, detail="El equipo no existe.")
        if equipo.estado != "Activo":
            raise HTTPException(status_code=400, detail="No se pueden agregar jugadores a un equipo inactivo.")

        # 2. HU52: Validar que el jugador no esté ya en el mismo equipo
        jugador_existente = db.query(EquipoJugador).filter(
            EquipoJugador.id_equipo == id_equipo,
            EquipoJugador.id_usuario == id_usuario
        ).first()

        if jugador_existente:
            raise HTTPException(status_code=409, detail="El jugador ya pertenece a este equipo.")

        # 3. (Opcional pero recomendado) Validar que el jugador no pertenezca a más de un equipo activo
        # jugador_otro_equipo = db.query(EquipoJugador).join(Equipo).filter(
        #    EquipoJugador.id_usuario == id_usuario,
        #    Equipo.estado == 'Activo'
        # ).first()
        # if jugador_otro_equipo:
        #    raise HTTPException(status_code=409, detail="El jugador ya pertenece a otro equipo activo.")

        # 4. Guardar
        return super().create(db, data)

equipo_jugador_service = EquipoJugadorService()
