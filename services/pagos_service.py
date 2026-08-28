from fastapi import HTTPException
from sqlalchemy.orm import Session
from services.base_service import BaseCRUDService
from models.modelos import Pago, Reserva, Inscripcion

class PagosService(BaseCRUDService):
    def __init__(self):
        super().__init__(Pago)

    def create(self, db: Session, data: dict):
        id_reserva = data.get("id_reserva")
        id_inscripcion = data.get("id_inscripcion")

        # 1. Validar que el pago esté asociado a una reserva o a una inscripción (HU62)
        if not id_reserva and not id_inscripcion:
            raise HTTPException(status_code=400, detail="El pago debe estar asociado a una reserva o a una inscripción.")

        # 2. Guardar el pago
        if "estado" not in data:
            data["estado"] = "Aprobado"
            
        nuevo_pago = super().create(db, data)

        # 3. Lógica Automática: Actualizar estado de la Reserva o Inscripción (HU62)
        if nuevo_pago.estado == "Aprobado":
            if id_reserva:
                reserva = db.query(Reserva).filter(Reserva.id_reserva == id_reserva).first()
                if reserva:
                    reserva.estado = "Confirmada"
            if id_inscripcion:
                inscripcion = db.query(Inscripcion).filter(Inscripcion.id_inscripcion == id_inscripcion).first()
                if inscripcion:
                    inscripcion.estado = "Confirmada"
            db.commit()

        return nuevo_pago

pagos_service = PagosService()
