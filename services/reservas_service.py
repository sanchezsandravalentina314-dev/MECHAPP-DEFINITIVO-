from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from services.base_service import BaseCRUDService
from models.modelos import Reserva, Cancha

class ReservasService(BaseCRUDService):
    def __init__(self):
        super().__init__(Reserva)

    def create(self, db: Session, data: dict):
        id_cancha = data.get("id_cancha")
        fecha = data.get("fecha")
        hora_inicio = data.get("hora_inicio")
        hora_fin = data.get("hora_fin")

        # 1. Validar que la cancha existe y está activa
        cancha = db.query(Cancha).filter(Cancha.id_cancha == id_cancha).first()
        if not cancha or not cancha.estado:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="La cancha seleccionada no existe o no está activa."
            )

        # 2. Validar que la hora de inicio sea menor a la hora fin
        if hora_inicio >= hora_fin:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="La hora de inicio debe ser anterior a la hora de fin."
            )

        # 3. Validar si ya existe una reserva que se cruce en el mismo horario (HU33 y HU34)
        # La lógica de solapamiento: (InicioA < FinB) y (FinA > InicioB)
        reserva_existente = db.query(Reserva).filter(
            Reserva.id_cancha == id_cancha,
            Reserva.fecha == fecha,
            Reserva.estado != 'Cancelada',
            and_(
                Reserva.hora_inicio < hora_fin,
                Reserva.hora_fin > hora_inicio
            )
        ).first()

        if reserva_existente:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"La cancha ya se encuentra reservada en el horario solicitado (Cruce con reserva ID {reserva_existente.id_reserva})."
            )

        # 4. Asignar estado inicial si no viene
        if "estado" not in data:
            data["estado"] = "Pendiente"

        # 5. Guardar la reserva
        return super().create(db, data)

reservas_service = ReservasService()
