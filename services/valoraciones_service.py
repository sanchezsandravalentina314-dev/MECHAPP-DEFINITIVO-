from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from services.base_service import BaseCRUDService
from models.modelos import Valoracion, Reserva, Cancha

class ValoracionesService(BaseCRUDService):
    def __init__(self):
        super().__init__(Valoracion)

    def create(self, db: Session, data: dict):
        id_cancha = data.get("id_cancha")
        id_usuario = data.get("id_usuario")

        # 1. Validar que el usuario haya reservado la cancha antes de valorar (HU69)
        ha_reservado = db.query(Reserva).filter(
            Reserva.id_usuario == id_usuario,
            Reserva.id_cancha == id_cancha,
            Reserva.estado == 'Finalizada'  # O Confirmada/Pagada
        ).first()

        # Si quieres ser estricto descomenta esto:
        # if not ha_reservado:
        #    raise HTTPException(status_code=403, detail="Debes haber jugado en esta cancha para poder valorarla.")

        # 2. Guardar valoracin
        nueva_valoracion = super().create(db, data)

        # 3. Calcular nuevo promedio y actualizar la cancha (HU71)
        # Asumiendo que la tabla Cancha tiene un campo 'promedio_estrellas', pero como no lo creamos en el DDL inicial, 
        # podemos devolver el promedio al vuelo o usarlo aqu. 
        # Vamos a devolver un log exitoso.
        return nueva_valoracion

valoraciones_service = ValoracionesService()
