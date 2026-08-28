from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from services.base_service import BaseCRUDService
from models.modelos import Inscripcion, Torneo

class InscripcionesService(BaseCRUDService):
    def __init__(self):
        super().__init__(Inscripcion)

    def create(self, db: Session, data: dict):
        id_torneo = data.get("id_torneo")
        id_usuario = data.get("id_usuario")

        # 1. Validar que el torneo exista y esté disponible
        torneo = db.query(Torneo).filter(Torneo.id_torneo == id_torneo).first()
        if not torneo:
            raise HTTPException(status_code=404, detail="El torneo no existe.")
        if torneo.estado != "Disponible":
            raise HTTPException(status_code=400, detail=f"El torneo no está disponible para inscripciones (Estado actual: {torneo.estado}).")

        # 2. Validar que el usuario no esté inscrito ya en el mismo torneo
        inscripcion_previa = db.query(Inscripcion).filter(
            Inscripcion.id_torneo == id_torneo,
            Inscripcion.id_usuario == id_usuario,
            Inscripcion.estado != "Cancelada"
        ).first()
        
        if inscripcion_previa:
            raise HTTPException(status_code=409, detail="Ya te encuentras inscrito en este torneo.")

        # 3. Validar disponibilidad de cupos (HU48)
        if torneo.cupo_maximo is not None:
            inscritos_actuales = db.query(Inscripcion).filter(
                Inscripcion.id_torneo == id_torneo,
                Inscripcion.estado != "Cancelada"
            ).count()
            
            if inscritos_actuales >= torneo.cupo_maximo:
                raise HTTPException(status_code=400, detail="El torneo ya ha alcanzado el límite máximo de participantes.")

        # 4. Asignar estado inicial si no viene
        if "estado" not in data:
            data["estado"] = "Activa"

        return super().create(db, data)

inscripciones_service = InscripcionesService()
