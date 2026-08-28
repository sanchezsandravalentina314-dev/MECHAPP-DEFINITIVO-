from fastapi import HTTPException
from sqlalchemy.orm import Session
from services.base_service import BaseCRUDService
from models.modelos import InscripcionEquipo, Torneo, Equipo

class InscripcionEquiposService(BaseCRUDService):
    def __init__(self):
        super().__init__(InscripcionEquipo)

    def create(self, db: Session, data: dict):
        id_torneo = data.get("id_torneo")
        id_equipo = data.get("id_equipo")

        # 1. Validar que el torneo exista y esté disponible
        torneo = db.query(Torneo).filter(Torneo.id_torneo == id_torneo).first()
        if not torneo:
            raise HTTPException(status_code=404, detail="El torneo no existe.")
        if torneo.estado != "Disponible":
            raise HTTPException(status_code=400, detail=f"El torneo no está disponible para inscripciones.")

        # 2. Validar que el equipo exista
        equipo = db.query(Equipo).filter(Equipo.id_equipo == id_equipo).first()
        if not equipo:
            raise HTTPException(status_code=404, detail="El equipo no existe.")

        # 3. Validar que el equipo no esté ya inscrito en el mismo torneo
        inscripcion_previa = db.query(InscripcionEquipo).filter(
            InscripcionEquipo.id_torneo == id_torneo,
            InscripcionEquipo.id_equipo == id_equipo,
            InscripcionEquipo.estado != "Cancelada"
        ).first()
        
        if inscripcion_previa:
            raise HTTPException(status_code=409, detail="El equipo ya se encuentra inscrito en este torneo.")

        # 4. Validar disponibilidad de cupos (HU45 / HU48)
        if torneo.cupo_maximo is not None:
            # Contar inscripciones individuales
            from models.modelos import Inscripcion
            inscritos_indiv = db.query(Inscripcion).filter(
                Inscripcion.id_torneo == id_torneo,
                Inscripcion.estado != "Cancelada"
            ).count()
            
            # Contar inscripciones de equipos
            inscritos_equipos = db.query(InscripcionEquipo).filter(
                InscripcionEquipo.id_torneo == id_torneo,
                InscripcionEquipo.estado != "Cancelada"
            ).count()
            
            total_inscritos = inscritos_indiv + inscritos_equipos
            
            if total_inscritos >= torneo.cupo_maximo:
                raise HTTPException(status_code=400, detail="El torneo ya ha alcanzado el límite máximo de participantes.")

        # 5. Asignar estado inicial si no viene
        if "estado" not in data:
            data["estado"] = "Activa"

        return super().create(db, data)

inscripcion_equipos_service = InscripcionEquiposService()
