from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config.database import get_db
from schemas.inscripcion_equipos_schema import InscripcionEquipoCreate, InscripcionEquipoUpdate, InscripcionEquipoResponse
from controllers import inscripcion_equipos_controller as controller

router = APIRouter(prefix="/api/inscripcion_equipos", tags=["Inscripcion Equipos"])

@router.get("/", response_model=List[InscripcionEquipoResponse])
def listar_inscripcion_equipos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return controller.listar(db, skip, limit)

@router.get("/{item_id}", response_model=InscripcionEquipoResponse)
def obtener_inscripcion_equipos(item_id: int, db: Session = Depends(get_db)):
    return controller.obtener(db, item_id)

@router.post("/", response_model=InscripcionEquipoResponse, status_code=201)
def crear_inscripcion_equipos(datos: InscripcionEquipoCreate, db: Session = Depends(get_db)):
    return controller.crear(db, datos)

@router.put("/{item_id}", response_model=InscripcionEquipoResponse)
def actualizar_inscripcion_equipos(item_id: int, datos: InscripcionEquipoUpdate, db: Session = Depends(get_db)):
    return controller.actualizar(db, item_id, datos)

@router.delete("/{item_id}")
def eliminar_inscripcion_equipos(item_id: int, db: Session = Depends(get_db)):
    return controller.eliminar(db, item_id)
