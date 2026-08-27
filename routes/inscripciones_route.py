from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config.database import get_db
from schemas.inscripciones_schema import InscripcionCreate, InscripcionUpdate, InscripcionResponse
from controllers import inscripciones_controller as controller

router = APIRouter(prefix="/api/inscripciones", tags=["Inscripciones"])

@router.get("/", response_model=List[InscripcionResponse])
def listar_inscripciones(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return controller.listar(db, skip, limit)

@router.get("/{item_id}", response_model=InscripcionResponse)
def obtener_inscripciones(item_id: int, db: Session = Depends(get_db)):
    return controller.obtener(db, item_id)

@router.post("/", response_model=InscripcionResponse, status_code=201)
def crear_inscripciones(datos: InscripcionCreate, db: Session = Depends(get_db)):
    return controller.crear(db, datos)

@router.put("/{item_id}", response_model=InscripcionResponse)
def actualizar_inscripciones(item_id: int, datos: InscripcionUpdate, db: Session = Depends(get_db)):
    return controller.actualizar(db, item_id, datos)

@router.delete("/{item_id}")
def eliminar_inscripciones(item_id: int, db: Session = Depends(get_db)):
    return controller.eliminar(db, item_id)
