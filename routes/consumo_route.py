"""
Routes del módulo Combos y Consumo para MechApp.
Usa la autenticación JWT existente (get_current_user, require_role).
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from config.database import get_db
from utils.dependencies import get_current_user, require_role
from models.modelos import Usuario
from schemas.consumo_schema import (
    CategoriaCreate, CategoriaResponse,
    ProductoCreate, ProductoUpdate, ProductoResponse,
    ComboCreate, ComboUpdate, ComboResponse,
    PedidoCreate, PedidoResponse, PedidoEstadoUpdate,
)
import services.consumo_service as svc

router = APIRouter(prefix="/api/consumo", tags=["Combos y Consumo"])


# ─── CATEGORÍAS ──────────────────────────────────────────────────────────

@router.get("/categorias", response_model=List[CategoriaResponse])
def listar_categorias(db: Session = Depends(get_db)):
    return svc.listar_categorias(db)

@router.post("/categorias", response_model=CategoriaResponse, status_code=201)
def crear_categoria(
    datos: CategoriaCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(require_role("Administrador"))
):
    return svc.crear_categoria(db, datos)


# ─── PRODUCTOS ───────────────────────────────────────────────────────────

@router.get("/productos", response_model=List[ProductoResponse])
def listar_productos(
    id_cancha: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    return svc.listar_productos(db, id_cancha=id_cancha)

@router.get("/productos/todos", response_model=List[ProductoResponse])
def listar_todos_productos(
    id_cancha: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(require_role("Administrador", "Propietario"))
):
    return svc.listar_productos(db, id_cancha=id_cancha, solo_activos=False)

@router.get("/productos/stock-bajo", response_model=List[ProductoResponse])
def stock_bajo(
    id_cancha: int = Query(...),
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    return svc.listar_stock_bajo(db, id_cancha, usuario)

@router.get("/productos/{id_producto}", response_model=ProductoResponse)
def obtener_producto(id_producto: int, db: Session = Depends(get_db)):
    return svc.obtener_producto(db, id_producto)

@router.post("/productos", response_model=ProductoResponse, status_code=201)
def crear_producto(
    datos: ProductoCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(require_role("Administrador", "Propietario"))
):
    return svc.crear_producto(db, datos, usuario)

@router.put("/productos/{id_producto}", response_model=ProductoResponse)
def actualizar_producto(
    id_producto: int,
    datos: ProductoUpdate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(require_role("Administrador", "Propietario"))
):
    return svc.actualizar_producto(db, id_producto, datos, usuario)

@router.delete("/productos/{id_producto}")
def eliminar_producto(
    id_producto: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(require_role("Administrador", "Propietario"))
):
    return svc.eliminar_producto(db, id_producto, usuario)


# ─── COMBOS ──────────────────────────────────────────────────────────────

@router.get("/combos", response_model=List[ComboResponse])
def listar_combos(
    id_cancha: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    return svc.listar_combos(db, id_cancha=id_cancha)

@router.get("/combos/todos", response_model=List[ComboResponse])
def listar_todos_combos(
    id_cancha: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(require_role("Administrador", "Propietario"))
):
    return svc.listar_combos(db, id_cancha=id_cancha, solo_activos=False)

@router.get("/combos/{id_combo}", response_model=ComboResponse)
def obtener_combo(id_combo: int, db: Session = Depends(get_db)):
    return svc.obtener_combo(db, id_combo)

@router.post("/combos", response_model=ComboResponse, status_code=201)
def crear_combo(
    datos: ComboCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(require_role("Administrador", "Propietario"))
):
    return svc.crear_combo(db, datos, usuario)

@router.put("/combos/{id_combo}", response_model=ComboResponse)
def actualizar_combo(
    id_combo: int,
    datos: ComboUpdate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(require_role("Administrador", "Propietario"))
):
    return svc.actualizar_combo(db, id_combo, datos, usuario)

@router.delete("/combos/{id_combo}")
def eliminar_combo(
    id_combo: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(require_role("Administrador", "Propietario"))
):
    return svc.eliminar_combo(db, id_combo, usuario)


# ─── PEDIDOS ─────────────────────────────────────────────────────────────

@router.get("/pedidos", response_model=List[PedidoResponse])
def listar_pedidos(
    id_cancha: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    return svc.listar_pedidos(db, usuario, id_cancha)

@router.get("/pedidos/{id_pedido}", response_model=PedidoResponse)
def obtener_pedido(
    id_pedido: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    return svc.obtener_pedido(db, id_pedido, usuario)

@router.post("/pedidos", response_model=PedidoResponse, status_code=201)
def crear_pedido(
    datos: PedidoCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    return svc.crear_pedido(db, datos, usuario)

@router.patch("/pedidos/{id_pedido}/estado", response_model=PedidoResponse)
def actualizar_estado(
    id_pedido: int,
    datos: PedidoEstadoUpdate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(require_role("Administrador", "Propietario"))
):
    return svc.actualizar_estado_pedido(db, id_pedido, datos, usuario)


# ─── ESTADÍSTICAS ────────────────────────────────────────────────────────

@router.get("/estadisticas")
def estadisticas(
    id_cancha: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(require_role("Administrador", "Propietario"))
):
    return svc.obtener_estadisticas(db, usuario, id_cancha)
