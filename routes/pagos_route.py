from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config.database import get_db
from schemas.pagos_schema import PagoCreate, PagoUpdate, PagoResponse
from controllers import pagos_controller as controller

router = APIRouter(prefix="/api/pagos", tags=["Pagos"])

@router.get("/", response_model=List[PagoResponse])
def listar_pagos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return controller.listar(db, skip, limit)

@router.get("/{item_id}", response_model=PagoResponse)
def obtener_pagos(item_id: int, db: Session = Depends(get_db)):
    return controller.obtener(db, item_id)

@router.post("/", response_model=PagoResponse, status_code=201)
def crear_pagos(datos: PagoCreate, db: Session = Depends(get_db)):
    return controller.crear(db, datos)

@router.put("/{item_id}", response_model=PagoResponse)
def actualizar_pagos(item_id: int, datos: PagoUpdate, db: Session = Depends(get_db)):
    return controller.actualizar(db, item_id, datos)

@router.delete("/{item_id}")
def eliminar_pagos(item_id: int, db: Session = Depends(get_db)):
    return controller.eliminar(db, item_id)
