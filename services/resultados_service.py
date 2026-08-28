from fastapi import HTTPException
from sqlalchemy.orm import Session
from services.base_service import BaseCRUDService
from models.modelos import Resultado, Partido

class ResultadosService(BaseCRUDService):
    def __init__(self):
        super().__init__(Resultado)

    def create(self, db: Session, data: dict):
        id_partido = data.get("id_partido")
        puntos_local = data.get("puntos_local", 0)
        puntos_visitante = data.get("puntos_visitante", 0)

        # 1. Buscar el partido asociado
        partido = db.query(Partido).filter(Partido.id_partido == id_partido).first()
        if not partido:
            raise HTTPException(status_code=404, detail="El partido no existe.")
        
        if partido.estado == "Finalizado":
            raise HTTPException(status_code=400, detail="El partido ya ha sido finalizado y tiene resultado.")

        # 2. Lógica Automática: ¿Quién ganó? (HU60)
        if puntos_local > puntos_visitante:
            data["id_equipo_ganador"] = partido.id_equipo_local
        elif puntos_visitante > puntos_local:
            data["id_equipo_ganador"] = partido.id_equipo_visitante
        else:
            # En caso de empate, se puede dejar nulo o manejar según reglas (por ahora None)
            data["id_equipo_ganador"] = None

        # 3. Guardar el resultado
        nuevo_resultado = super().create(db, data)

        # 4. Actualizar automáticamente el estado del partido a "Finalizado"
        partido.estado = "Finalizado"
        db.commit()

        return nuevo_resultado

resultados_service = ResultadosService()
