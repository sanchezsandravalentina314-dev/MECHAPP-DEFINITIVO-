"""
Schemas Pydantic para el módulo Combos y Consumo de MechApp.
"""
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, field_validator


# ─── CATEGORIA ───────────────────────────────────────────────────

class CategoriaCreate(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    icono: Optional[str] = "🍽️"

class CategoriaResponse(BaseModel):
    id_categoria: int
    nombre: str
    descripcion: Optional[str] = None
    icono: Optional[str] = None
    estado: bool
    model_config = ConfigDict(from_attributes=True)


# ─── PRODUCTO ───────────────────────────────────────────────────

class ProductoCreate(BaseModel):
    id_cancha: int
    id_categoria: Optional[int] = None
    nombre: str
    descripcion: Optional[str] = None
    precio: Decimal
    imagen_url: Optional[str] = None
    stock: int = 0
    stock_minimo: int = 5

    @field_validator("precio")
    @classmethod
    def precio_positivo(cls, v):
        if v <= 0:
            raise ValueError("El precio debe ser mayor que cero")
        return v

    @field_validator("stock")
    @classmethod
    def stock_no_negativo(cls, v):
        if v < 0:
            raise ValueError("El stock no puede ser negativo")
        return v

class ProductoUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    precio: Optional[Decimal] = None
    imagen_url: Optional[str] = None
    stock: Optional[int] = None
    stock_minimo: Optional[int] = None
    id_categoria: Optional[int] = None
    estado: Optional[bool] = None

class ProductoResponse(BaseModel):
    id_producto: int
    id_cancha: int
    id_categoria: Optional[int] = None
    nombre: str
    descripcion: Optional[str] = None
    precio: Decimal
    imagen_url: Optional[str] = None
    stock: int
    stock_minimo: int
    estado: bool
    fecha_creacion: datetime
    model_config = ConfigDict(from_attributes=True)


# ─── COMBO ───────────────────────────────────────────────────────

class ComboProductoItem(BaseModel):
    id_producto: int
    cantidad: int = 1

    @field_validator("cantidad")
    @classmethod
    def cantidad_positiva(cls, v):
        if v < 1:
            raise ValueError("La cantidad debe ser al menos 1")
        return v

class ComboProductoResponse(BaseModel):
    id_combo_producto: int
    id_producto: int
    cantidad: int
    producto: Optional[ProductoResponse] = None
    model_config = ConfigDict(from_attributes=True)

class ComboCreate(BaseModel):
    id_cancha: int
    nombre: str
    descripcion: Optional[str] = None
    precio: Decimal
    personas_min: int = 1
    personas_max: int = 10
    imagen_url: Optional[str] = None
    productos: List[ComboProductoItem] = []

    @field_validator("precio")
    @classmethod
    def precio_positivo(cls, v):
        if v <= 0:
            raise ValueError("El precio del combo debe ser mayor que cero")
        return v

    @field_validator("productos")
    @classmethod
    def al_menos_un_producto(cls, v):
        if len(v) == 0:
            raise ValueError("El combo debe incluir al menos un producto")
        return v

class ComboUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    precio: Optional[Decimal] = None
    personas_min: Optional[int] = None
    personas_max: Optional[int] = None
    imagen_url: Optional[str] = None
    estado: Optional[bool] = None
    productos: Optional[List[ComboProductoItem]] = None

class ComboResponse(BaseModel):
    id_combo: int
    id_cancha: int
    nombre: str
    descripcion: Optional[str] = None
    precio: Decimal
    personas_min: int
    personas_max: int
    imagen_url: Optional[str] = None
    estado: bool
    fecha_creacion: datetime
    productos: List[ComboProductoResponse] = []
    model_config = ConfigDict(from_attributes=True)


# ─── PEDIDO ──────────────────────────────────────────────────────

class DetallePedidoCreate(BaseModel):
    id_producto: Optional[int] = None
    id_combo: Optional[int] = None
    cantidad: int = 1

    @field_validator("cantidad")
    @classmethod
    def cantidad_positiva(cls, v):
        if v < 1:
            raise ValueError("La cantidad debe ser al menos 1")
        return v

class DetallePedidoResponse(BaseModel):
    id_detalle: int
    id_producto: Optional[int] = None
    id_combo: Optional[int] = None
    cantidad: int
    precio_unitario: Decimal
    subtotal: Decimal
    producto: Optional[ProductoResponse] = None
    combo: Optional[ComboResponse] = None
    model_config = ConfigDict(from_attributes=True)

class PedidoCreate(BaseModel):
    id_reserva: Optional[int] = None
    id_cancha: int
    observaciones: Optional[str] = None
    items: List[DetallePedidoCreate]

    @field_validator("items")
    @classmethod
    def al_menos_un_item(cls, v):
        if len(v) == 0:
            raise ValueError("El pedido debe tener al menos un producto o combo")
        return v

class PedidoEstadoUpdate(BaseModel):
    estado: str

    @field_validator("estado")
    @classmethod
    def estado_valido(cls, v):
        estados = ["Pendiente", "Confirmado", "En preparación", "Listo", "Entregado", "Cancelado"]
        if v not in estados:
            raise ValueError(f"Estado inválido. Debe ser uno de: {', '.join(estados)}")
        return v

class PedidoResponse(BaseModel):
    id_pedido: int
    id_usuario: int
    id_reserva: Optional[int] = None
    id_cancha: int
    fecha_pedido: datetime
    subtotal: Decimal
    total: Decimal
    observaciones: Optional[str] = None
    estado: str
    detalles: List[DetallePedidoResponse] = []
    model_config = ConfigDict(from_attributes=True)


# ─── ESTADÍSTICAS ────────────────────────────────────────────────

class EstadisticasConsumo(BaseModel):
    ventas_hoy: Decimal = Decimal("0")
    pedidos_hoy: int = 0
    ventas_semana: Decimal = Decimal("0")
    ventas_mes: Decimal = Decimal("0")
    ingresos_mes: Decimal = Decimal("0")
    pedidos_mes: int = 0
    ticket_promedio: Decimal = Decimal("0")
    productos_vendidos_hoy: int = 0
    combos_vendidos_hoy: int = 0
    productos_stock_bajo: int = 0
    top_combos: List[dict] = []
    top_productos: List[dict] = []
