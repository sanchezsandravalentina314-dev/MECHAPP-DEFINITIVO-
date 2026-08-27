from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config.database import get_db
from schemas.resultados_schema import ResultadoCreate, ResultadoUpdate, ResultadoResponse
from controllers import resultados_controller as controller

router = APIRouter(prefix="/api/resultados", tags=["Resultados"])

@router.get("/", response_model=List[ResultadoResponse])
def listar_resultados(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return controller.listar(db, skip, limit)

@router.get("/{item_id}", response_model=ResultadoResponse)
def obtener_resultados(item_id: int, db: Session = Depends(get_db)):
    return controller.obtener(db, item_id)

@router.post("/", response_model=ResultadoResponse, status_code=201)
def crear_resultados(datos: ResultadoCreate, db: Session = Depends(get_db)):
    return controller.crear(db, datos)

@router.put("/{item_id}", response_model=ResultadoResponse)
def actualizar_resultados(item_id: int, datos: ResultadoUpdate, db: Session = Depends(get_db)):
    return controller.actualizar(db, item_id, datos)

@router.delete("/{item_id}")
def eliminar_resultados(item_id: int, db: Session = Depends(get_db)):
    return controller.eliminar(db, item_id)
