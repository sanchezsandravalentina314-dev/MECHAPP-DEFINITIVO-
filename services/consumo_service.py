"""
Servicio de lógica de negocio para el módulo Combos y Consumo de MechApp.
"""
from datetime import datetime, timedelta
from decimal import Decimal
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status

from models.consumo_modelos import (
    CategoriaProducto, Producto, Combo, ComboProducto, Pedido, DetallePedido
)
from models.modelos import Cancha, Usuario
from schemas.consumo_schema import (
    CategoriaCreate, ProductoCreate, ProductoUpdate,
    ComboCreate, ComboUpdate, PedidoCreate, PedidoEstadoUpdate
)


# ── HELPER: verificar que la cancha pertenezca al propietario ──────────────

def _verificar_propietario_cancha(db: Session, id_cancha: int, id_usuario: int) -> Cancha:
    cancha = db.query(Cancha).filter(Cancha.id_cancha == id_cancha).first()
    if not cancha:
        raise HTTPException(status_code=404, detail="Cancha no encontrada")
    if cancha.id_usuario != id_usuario:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para gestionar esta cancha"
        )
    return cancha


# ── CATEGORÍAS ────────────────────────────────────────────────────────────

def listar_categorias(db: Session):
    return db.query(CategoriaProducto).filter(CategoriaProducto.estado == True).all()

def crear_categoria(db: Session, datos: CategoriaCreate):
    cat = CategoriaProducto(**datos.model_dump())
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


# ── PRODUCTOS ─────────────────────────────────────────────────────────────

def listar_productos(db: Session, id_cancha: Optional[int] = None, solo_activos: bool = True):
    q = db.query(Producto)
    if id_cancha:
        q = q.filter(Producto.id_cancha == id_cancha)
    if solo_activos:
        q = q.filter(Producto.estado == True)
    return q.order_by(Producto.nombre).all()

def obtener_producto(db: Session, id_producto: int):
    p = db.query(Producto).filter(Producto.id_producto == id_producto).first()
    if not p:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return p

def crear_producto(db: Session, datos: ProductoCreate, usuario_actual: Usuario):
    if usuario_actual.id_rol != 1:  # No admin
        _verificar_propietario_cancha(db, datos.id_cancha, usuario_actual.id_usuario)
    producto = Producto(**datos.model_dump())
    db.add(producto)
    db.commit()
    db.refresh(producto)
    return producto

def actualizar_producto(db: Session, id_producto: int, datos: ProductoUpdate, usuario_actual: Usuario):
    producto = obtener_producto(db, id_producto)
    if usuario_actual.id_rol != 1:
        _verificar_propietario_cancha(db, producto.id_cancha, usuario_actual.id_usuario)
    for campo, valor in datos.model_dump(exclude_none=True).items():
        setattr(producto, campo, valor)
    producto.fecha_actualizacion = datetime.utcnow()
    db.commit()
    db.refresh(producto)
    return producto

def eliminar_producto(db: Session, id_producto: int, usuario_actual: Usuario):
    producto = obtener_producto(db, id_producto)
    if usuario_actual.id_rol != 1:
        _verificar_propietario_cancha(db, producto.id_cancha, usuario_actual.id_usuario)
    producto.estado = False
    db.commit()
    return {"mensaje": "Producto desactivado correctamente"}

def listar_stock_bajo(db: Session, id_cancha: int, usuario_actual: Usuario):
    if usuario_actual.id_rol != 1:
        _verificar_propietario_cancha(db, id_cancha, usuario_actual.id_usuario)
    return db.query(Producto).filter(
        Producto.id_cancha == id_cancha,
        Producto.stock <= Producto.stock_minimo,
        Producto.estado == True
    ).all()


# ── COMBOS ────────────────────────────────────────────────────────────────

def listar_combos(db: Session, id_cancha: Optional[int] = None, solo_activos: bool = True):
    q = db.query(Combo)
    if id_cancha:
        q = q.filter(Combo.id_cancha == id_cancha)
    if solo_activos:
        q = q.filter(Combo.estado == True)
    return q.order_by(Combo.nombre).all()

def obtener_combo(db: Session, id_combo: int):
    c = db.query(Combo).filter(Combo.id_combo == id_combo).first()
    if not c:
        raise HTTPException(status_code=404, detail="Combo no encontrado")
    return c

def crear_combo(db: Session, datos: ComboCreate, usuario_actual: Usuario):
    if usuario_actual.id_rol != 1:
        _verificar_propietario_cancha(db, datos.id_cancha, usuario_actual.id_usuario)
    combo_data = datos.model_dump(exclude={"productos"})
    combo = Combo(**combo_data)
    db.add(combo)
    db.flush()  # Para obtener el id_combo antes del commit

    for item in datos.productos:
        producto = db.query(Producto).filter(Producto.id_producto == item.id_producto).first()
        if not producto:
            db.rollback()
            raise HTTPException(status_code=404, detail=f"Producto {item.id_producto} no encontrado")
        cp = ComboProducto(id_combo=combo.id_combo, id_producto=item.id_producto, cantidad=item.cantidad)
        db.add(cp)

    db.commit()
    db.refresh(combo)
    return combo

def actualizar_combo(db: Session, id_combo: int, datos: ComboUpdate, usuario_actual: Usuario):
    combo = obtener_combo(db, id_combo)
    if usuario_actual.id_rol != 1:
        _verificar_propietario_cancha(db, combo.id_cancha, usuario_actual.id_usuario)

    update_data = datos.model_dump(exclude_none=True, exclude={"productos"})
    for campo, valor in update_data.items():
        setattr(combo, campo, valor)
    combo.fecha_actualizacion = datetime.utcnow()

    if datos.productos is not None:
        # Eliminar productos anteriores y reemplazar
        db.query(ComboProducto).filter(ComboProducto.id_combo == id_combo).delete()
        for item in datos.productos:
            cp = ComboProducto(id_combo=id_combo, id_producto=item.id_producto, cantidad=item.cantidad)
            db.add(cp)

    db.commit()
    db.refresh(combo)
    return combo

def eliminar_combo(db: Session, id_combo: int, usuario_actual: Usuario):
    combo = obtener_combo(db, id_combo)
    if usuario_actual.id_rol != 1:
        _verificar_propietario_cancha(db, combo.id_cancha, usuario_actual.id_usuario)
    combo.estado = False
    db.commit()
    return {"mensaje": "Combo desactivado correctamente"}


# ── PEDIDOS ───────────────────────────────────────────────────────────────

def _calcular_subtotal_item(db: Session, item) -> Decimal:
    if item.id_producto:
        p = db.query(Producto).filter(Producto.id_producto == item.id_producto, Producto.estado == True).first()
        if not p:
            raise HTTPException(status_code=404, detail=f"Producto {item.id_producto} no disponible")
        return Decimal(str(p.precio)) * item.cantidad, Decimal(str(p.precio))
    elif item.id_combo:
        c = db.query(Combo).filter(Combo.id_combo == item.id_combo, Combo.estado == True).first()
        if not c:
            raise HTTPException(status_code=404, detail=f"Combo {item.id_combo} no disponible")
        return Decimal(str(c.precio)) * item.cantidad, Decimal(str(c.precio))
    raise HTTPException(status_code=400, detail="Cada item debe tener id_producto o id_combo")

def crear_pedido(db: Session, datos: PedidoCreate, usuario_actual: Usuario):
    total = Decimal("0")
    pedido = Pedido(
        id_usuario=usuario_actual.id_usuario,
        id_reserva=datos.id_reserva,
        id_cancha=datos.id_cancha,
        observaciones=datos.observaciones,
        subtotal=Decimal("0"),
        total=Decimal("0"),
        estado="Pendiente"
    )
    db.add(pedido)
    db.flush()

    for item in datos.items:
        subtotal_item, precio_unit = _calcular_subtotal_item(db, item)
        detalle = DetallePedido(
            id_pedido=pedido.id_pedido,
            id_producto=item.id_producto,
            id_combo=item.id_combo,
            cantidad=item.cantidad,
            precio_unitario=precio_unit,
            subtotal=subtotal_item
        )
        db.add(detalle)
        total += subtotal_item

    pedido.subtotal = total
    pedido.total = total
    db.commit()
    db.refresh(pedido)
    return pedido

def listar_pedidos(db: Session, usuario_actual: Usuario, id_cancha: Optional[int] = None):
    q = db.query(Pedido)
    if usuario_actual.id_rol == 1:  # Admin: todos los pedidos
        if id_cancha:
            q = q.filter(Pedido.id_cancha == id_cancha)
    elif usuario_actual.id_rol == 3:  # Propietario: solo sus canchas
        canchas_ids = [c.id_cancha for c in db.query(Cancha).filter(Cancha.id_usuario == usuario_actual.id_usuario).all()]
        q = q.filter(Pedido.id_cancha.in_(canchas_ids))
    else:  # Cliente: solo los suyos
        q = q.filter(Pedido.id_usuario == usuario_actual.id_usuario)
    return q.order_by(Pedido.fecha_pedido.desc()).all()

def obtener_pedido(db: Session, id_pedido: int, usuario_actual: Usuario):
    pedido = db.query(Pedido).filter(Pedido.id_pedido == id_pedido).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    if usuario_actual.id_rol == 1:
        return pedido
    if usuario_actual.id_rol == 3:
        canchas_ids = [c.id_cancha for c in db.query(Cancha).filter(Cancha.id_usuario == usuario_actual.id_usuario).all()]
        if pedido.id_cancha not in canchas_ids:
            raise HTTPException(status_code=403, detail="No tienes acceso a este pedido")
    elif pedido.id_usuario != usuario_actual.id_usuario:
        raise HTTPException(status_code=403, detail="No tienes acceso a este pedido")
    return pedido

def actualizar_estado_pedido(db: Session, id_pedido: int, datos: PedidoEstadoUpdate, usuario_actual: Usuario):
    pedido = obtener_pedido(db, id_pedido, usuario_actual)
    if usuario_actual.id_rol == 2:  # Cliente no puede cambiar estado
        raise HTTPException(status_code=403, detail="No tienes permisos para cambiar el estado del pedido")
    pedido.estado = datos.estado
    db.commit()
    db.refresh(pedido)
    return pedido


# ── ESTADÍSTICAS ──────────────────────────────────────────────────────────

def obtener_estadisticas(db: Session, usuario_actual: Usuario, id_cancha: Optional[int] = None):
    hoy = datetime.utcnow().date()
    inicio_semana = hoy - timedelta(days=hoy.weekday())
    inicio_mes = hoy.replace(day=1)

    # Filtro de canchas según rol
    if usuario_actual.id_rol == 1:
        canchas_ids = [c.id_cancha for c in db.query(Cancha.id_cancha).all()] if not id_cancha else [id_cancha]
    else:
        canchas_ids = [c.id_cancha for c in db.query(Cancha).filter(Cancha.id_usuario == usuario_actual.id_usuario).all()]
        if id_cancha and id_cancha not in canchas_ids:
            raise HTTPException(status_code=403, detail="No tienes acceso a esa cancha")
        if id_cancha:
            canchas_ids = [id_cancha]

    def q_pedidos(desde_fecha):
        return db.query(func.sum(Pedido.total)).filter(
            Pedido.id_cancha.in_(canchas_ids),
            Pedido.estado != "Cancelado",
            func.date(Pedido.fecha_pedido) >= desde_fecha
        ).scalar() or Decimal("0")

    def q_count(desde_fecha):
        return db.query(func.count(Pedido.id_pedido)).filter(
            Pedido.id_cancha.in_(canchas_ids),
            Pedido.estado != "Cancelado",
            func.date(Pedido.fecha_pedido) >= desde_fecha
        ).scalar() or 0

    ventas_hoy  = q_pedidos(hoy)
    pedidos_hoy = q_count(hoy)
    ventas_mes  = q_pedidos(inicio_mes)
    pedidos_mes = q_count(inicio_mes)
    ticket_prom = (ventas_mes / pedidos_mes) if pedidos_mes > 0 else Decimal("0")

    # Stock bajo
    stock_bajo = db.query(func.count(Producto.id_producto)).filter(
        Producto.id_cancha.in_(canchas_ids),
        Producto.stock <= Producto.stock_minimo,
        Producto.estado == True
    ).scalar() or 0

    # Top combos (últimos 30 días)
    top_combos_raw = db.query(
        Combo.nombre,
        func.sum(DetallePedido.cantidad).label("total_vendidos")
    ).join(DetallePedido, DetallePedido.id_combo == Combo.id_combo)\
     .join(Pedido, Pedido.id_pedido == DetallePedido.id_pedido)\
     .filter(
        Pedido.id_cancha.in_(canchas_ids),
        Pedido.estado != "Cancelado",
        func.date(Pedido.fecha_pedido) >= inicio_mes
     ).group_by(Combo.nombre).order_by(func.sum(DetallePedido.cantidad).desc()).limit(5).all()

    top_productos_raw = db.query(
        Producto.nombre,
        func.sum(DetallePedido.cantidad).label("total_vendidos")
    ).join(DetallePedido, DetallePedido.id_producto == Producto.id_producto)\
     .join(Pedido, Pedido.id_pedido == DetallePedido.id_pedido)\
     .filter(
        Pedido.id_cancha.in_(canchas_ids),
        Pedido.estado != "Cancelado",
        func.date(Pedido.fecha_pedido) >= inicio_mes
     ).group_by(Producto.nombre).order_by(func.sum(DetallePedido.cantidad).desc()).limit(5).all()

    return {
        "ventas_hoy": float(ventas_hoy),
        "pedidos_hoy": pedidos_hoy,
        "ventas_semana": float(q_pedidos(inicio_semana)),
        "ventas_mes": float(ventas_mes),
        "ingresos_mes": float(ventas_mes),
        "pedidos_mes": pedidos_mes,
        "ticket_promedio": float(round(ticket_prom, 2)),
        "productos_stock_bajo": stock_bajo,
        "top_combos": [{"nombre": r.nombre, "total": int(r.total_vendidos)} for r in top_combos_raw],
        "top_productos": [{"nombre": r.nombre, "total": int(r.total_vendidos)} for r in top_productos_raw],
    }
