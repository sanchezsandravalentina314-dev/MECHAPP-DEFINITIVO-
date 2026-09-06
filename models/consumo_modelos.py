"""
Modelos SQLAlchemy para el módulo Combos y Consumo de MechApp.
Tablas: categorias_producto, productos, combos, combo_productos, pedidos, detalle_pedido
"""
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime,
    ForeignKey, Text, Numeric, UniqueConstraint
)
from sqlalchemy.orm import relationship
from config.database import Base


class CategoriaProducto(Base):
    __tablename__ = "categorias_producto"
    id_categoria = Column(Integer, primary_key=True, autoincrement=True)
    nombre       = Column(String(100), nullable=False, unique=True)
    descripcion  = Column(String(255))
    icono        = Column(String(10), default="🍽️")
    estado       = Column(Boolean, nullable=False, default=True)

    productos    = relationship("Producto", back_populates="categoria")


class Producto(Base):
    __tablename__ = "productos"
    id_producto      = Column(Integer, primary_key=True, autoincrement=True)
    id_cancha        = Column(Integer, ForeignKey("canchas.id_cancha"), nullable=False)
    id_categoria     = Column(Integer, ForeignKey("categorias_producto.id_categoria"), nullable=True)
    nombre           = Column(String(150), nullable=False)
    descripcion      = Column(Text)
    precio           = Column(Numeric(10, 2), nullable=False)
    imagen_url       = Column(String(500))
    stock            = Column(Integer, nullable=False, default=0)
    stock_minimo     = Column(Integer, nullable=False, default=5)
    estado           = Column(Boolean, nullable=False, default=True)
    fecha_creacion   = Column(DateTime, nullable=False, default=datetime.utcnow)
    fecha_actualizacion = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    cancha    = relationship("Cancha")
    categoria = relationship("CategoriaProducto", back_populates="productos")
    combo_items = relationship("ComboProducto", back_populates="producto")


class Combo(Base):
    __tablename__ = "combos"
    id_combo        = Column(Integer, primary_key=True, autoincrement=True)
    id_cancha       = Column(Integer, ForeignKey("canchas.id_cancha"), nullable=False)
    nombre          = Column(String(150), nullable=False)
    descripcion     = Column(Text)
    precio          = Column(Numeric(10, 2), nullable=False)
    personas_min    = Column(Integer, default=1)
    personas_max    = Column(Integer, default=10)
    imagen_url      = Column(String(500))
    estado          = Column(Boolean, nullable=False, default=True)
    fecha_creacion  = Column(DateTime, nullable=False, default=datetime.utcnow)
    fecha_actualizacion = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    cancha    = relationship("Cancha")
    productos = relationship("ComboProducto", back_populates="combo", cascade="all, delete-orphan")


class ComboProducto(Base):
    """Tabla intermedia que define qué productos y en qué cantidad incluye un combo."""
    __tablename__ = "combo_productos"
    id_combo_producto = Column(Integer, primary_key=True, autoincrement=True)
    id_combo          = Column(Integer, ForeignKey("combos.id_combo"), nullable=False)
    id_producto       = Column(Integer, ForeignKey("productos.id_producto"), nullable=False)
    cantidad          = Column(Integer, nullable=False, default=1)

    __table_args__ = (
        UniqueConstraint("id_combo", "id_producto", name="uq_combo_producto"),
    )

    combo    = relationship("Combo", back_populates="productos")
    producto = relationship("Producto", back_populates="combo_items")


class Pedido(Base):
    __tablename__ = "pedidos"
    id_pedido    = Column(Integer, primary_key=True, autoincrement=True)
    id_usuario   = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    id_reserva   = Column(Integer, ForeignKey("reservas.id_reserva"), nullable=True)
    id_cancha    = Column(Integer, ForeignKey("canchas.id_cancha"), nullable=False)
    fecha_pedido = Column(DateTime, nullable=False, default=datetime.utcnow)
    subtotal     = Column(Numeric(10, 2), nullable=False, default=0)
    total        = Column(Numeric(10, 2), nullable=False, default=0)
    observaciones = Column(Text)
    # Estados: Pendiente | Confirmado | En preparación | Listo | Entregado | Cancelado
    estado       = Column(String(30), nullable=False, default="Pendiente")

    usuario  = relationship("Usuario")
    reserva  = relationship("Reserva")
    cancha   = relationship("Cancha")
    detalles = relationship("DetallePedido", back_populates="pedido", cascade="all, delete-orphan")


class DetallePedido(Base):
    __tablename__ = "detalle_pedido"
    id_detalle      = Column(Integer, primary_key=True, autoincrement=True)
    id_pedido       = Column(Integer, ForeignKey("pedidos.id_pedido"), nullable=False)
    id_producto     = Column(Integer, ForeignKey("productos.id_producto"), nullable=True)
    id_combo        = Column(Integer, ForeignKey("combos.id_combo"), nullable=True)
    cantidad        = Column(Integer, nullable=False, default=1)
    precio_unitario = Column(Numeric(10, 2), nullable=False)
    subtotal        = Column(Numeric(10, 2), nullable=False)

    pedido   = relationship("Pedido", back_populates="detalles")
    producto = relationship("Producto")
    combo    = relationship("Combo")
