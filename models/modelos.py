"""
Modelos SQLAlchemy de MechApp.

Las 18 tablas principales reflejan la estructura DBML entregada:
roles, usuarios, ubicaciones, canchas, horarios_disponibles, reservas,
torneos, inscripciones, equipos, equipo_jugador, inscripcion_equipos,
partidos, resultados, metodos_pago, pagos, notificaciones, valoraciones
y favoritos.

Los modelos Evento, Noticia, Propietario y Reporte se conservan porque
forman parte del backend actual, aunque todavía no estén en la BD final.
"""
from datetime import datetime
from decimal import Decimal
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Date, Time,
    ForeignKey, Text, Numeric, UniqueConstraint
)
from sqlalchemy.orm import relationship
from config.database import Base


class Rol(Base):
    __tablename__ = "roles"
    id_rol = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(50), nullable=False, unique=True)
    descripcion = Column(String(150))
    estado = Column(Boolean, nullable=False, default=True)


class Usuario(Base):
    __tablename__ = "usuarios"
    id_usuario = Column(Integer, primary_key=True, autoincrement=True, index=True)
    id_rol = Column(Integer, ForeignKey("roles.id_rol"), nullable=False)
    nombre = Column(String(100), nullable=False)
    documento = Column(String(20), nullable=False, unique=True)
    correo = Column(String(150), nullable=False, unique=True, index=True)
    telefono = Column(String(20))
    contrasena = Column(String(255), nullable=False)
    estado = Column(Boolean, nullable=False, default=True)
    fecha_registro = Column(DateTime, nullable=False, default=datetime.utcnow)

    rol = relationship("Rol")


class Ubicacion(Base):
    __tablename__ = "ubicaciones"
    id_ubicacion = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(100), nullable=False)
    direccion = Column(String(200), nullable=False)
    ciudad = Column(String(100), nullable=False)
    barrio = Column(String(100))
    estado = Column(Boolean, nullable=False, default=True)


class Cancha(Base):
    __tablename__ = "canchas"
    id_cancha = Column(Integer, primary_key=True, autoincrement=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    id_ubicacion = Column(Integer, ForeignKey("ubicaciones.id_ubicacion"), nullable=False)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(Text)
    capacidad = Column(Integer)
    estado = Column(Boolean, nullable=False, default=True)
    precio_hora = Column(Numeric(10, 2))

    usuario = relationship("Usuario")
    ubicacion = relationship("Ubicacion")


class HorarioDisponible(Base):
    __tablename__ = "horarios_disponibles"
    id_horario = Column(Integer, primary_key=True, autoincrement=True)
    id_cancha = Column(Integer, ForeignKey("canchas.id_cancha"), nullable=False)
    fecha = Column(Date, nullable=False)
    hora_inicio = Column(Time, nullable=False)
    hora_fin = Column(Time, nullable=False)
    estado = Column(Boolean, nullable=False, default=True)

    cancha = relationship("Cancha")


class Reserva(Base):
    __tablename__ = "reservas"
    id_reserva = Column(Integer, primary_key=True, autoincrement=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    id_cancha = Column(Integer, ForeignKey("canchas.id_cancha"), nullable=False)
    fecha = Column(Date, nullable=False)
    hora_inicio = Column(Time, nullable=False)
    hora_fin = Column(Time, nullable=False)
    valor = Column(Numeric(10, 2), nullable=False)
    estado = Column(String(30), nullable=False)
    fecha_reserva = Column(DateTime, nullable=False, default=datetime.utcnow)

    usuario = relationship("Usuario")
    cancha = relationship("Cancha")


class Torneo(Base):
    __tablename__ = "torneos"
    id_torneo = Column(Integer, primary_key=True, autoincrement=True)
    id_cancha = Column(Integer, ForeignKey("canchas.id_cancha"), nullable=False)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(Text)
    fecha_inicio = Column(Date, nullable=False)
    fecha_fin = Column(Date, nullable=False)
    premio = Column(Numeric(12, 2))
    estado = Column(String(30), nullable=False)
    cupo_maximo = Column(Integer)

    cancha = relationship("Cancha")


class Inscripcion(Base):
    __tablename__ = "inscripciones"
    id_inscripcion = Column(Integer, primary_key=True, autoincrement=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    id_torneo = Column(Integer, ForeignKey("torneos.id_torneo"), nullable=False)
    fecha_inscripcion = Column(DateTime, nullable=False, default=datetime.utcnow)
    estado = Column(String(30), nullable=False)

    usuario = relationship("Usuario")
    torneo = relationship("Torneo")


class Equipo(Base):
    __tablename__ = "equipos"
    id_equipo = Column(Integer, primary_key=True, autoincrement=True)
    id_capitan = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(String(255))
    estado = Column(Boolean, nullable=False, default=True)
    fecha_creacion = Column(DateTime, nullable=False, default=datetime.utcnow)

    capitan = relationship("Usuario")


class EquipoJugador(Base):
    __tablename__ = "equipo_jugador"
    id_equipo_jugador = Column(Integer, primary_key=True, autoincrement=True)
    id_equipo = Column(Integer, ForeignKey("equipos.id_equipo"), nullable=False)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    fecha_ingreso = Column(Date, nullable=False)
    estado = Column(Boolean, nullable=False, default=True)

    __table_args__ = (
        UniqueConstraint("id_equipo", "id_usuario", name="uq_equipo_jugador"),
    )

    equipo = relationship("Equipo")
    usuario = relationship("Usuario")


class InscripcionEquipo(Base):
    __tablename__ = "inscripcion_equipos"
    id_inscripcion_equipo = Column(Integer, primary_key=True, autoincrement=True)
    id_equipo = Column(Integer, ForeignKey("equipos.id_equipo"), nullable=False)
    id_torneo = Column(Integer, ForeignKey("torneos.id_torneo"), nullable=False)
    fecha_inscripcion = Column(DateTime, nullable=False, default=datetime.utcnow)
    estado = Column(String(30), nullable=False)

    __table_args__ = (
        UniqueConstraint("id_equipo", "id_torneo", name="uq_inscripcion_equipo_torneo"),
    )

    equipo = relationship("Equipo")
    torneo = relationship("Torneo")


class Partido(Base):
    __tablename__ = "partidos"
    id_partido = Column(Integer, primary_key=True, autoincrement=True)
    id_torneo = Column(Integer, ForeignKey("torneos.id_torneo"), nullable=False)
    id_equipo_local = Column(Integer, ForeignKey("equipos.id_equipo"), nullable=False)
    id_equipo_visitante = Column(Integer, ForeignKey("equipos.id_equipo"), nullable=False)
    fecha = Column(Date, nullable=False)
    hora = Column(Time, nullable=False)
    ronda = Column(String(50))
    estado = Column(String(30), nullable=False)

    torneo = relationship("Torneo")
    equipo_local = relationship("Equipo", foreign_keys=[id_equipo_local])
    equipo_visitante = relationship("Equipo", foreign_keys=[id_equipo_visitante])


class Resultado(Base):
    __tablename__ = "resultados"
    id_resultado = Column(Integer, primary_key=True, autoincrement=True)
    id_partido = Column(Integer, ForeignKey("partidos.id_partido"), nullable=False, unique=True)
    id_equipo_ganador = Column(Integer, ForeignKey("equipos.id_equipo"))
    puntos_local = Column(Integer, nullable=False)
    puntos_visitante = Column(Integer, nullable=False)
    observaciones = Column(Text)

    partido = relationship("Partido")
    equipo_ganador = relationship("Equipo")


class MetodoPago(Base):
    __tablename__ = "metodos_pago"
    id_metodo_pago = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(50), nullable=False, unique=True)
    descripcion = Column(String(150))
    estado = Column(Boolean, nullable=False, default=True)


class Pago(Base):
    __tablename__ = "pagos"
    id_pago = Column(Integer, primary_key=True, autoincrement=True)
    id_metodo_pago = Column(Integer, ForeignKey("metodos_pago.id_metodo_pago"), nullable=False)
    id_reserva = Column(Integer, ForeignKey("reservas.id_reserva"))
    id_inscripcion = Column(Integer, ForeignKey("inscripciones.id_inscripcion"))
    valor = Column(Numeric(10, 2), nullable=False)
    fecha_pago = Column(DateTime, nullable=False, default=datetime.utcnow)
    estado = Column(String(30), nullable=False)
    referencia = Column(String(100))

    metodo_pago = relationship("MetodoPago")
    reserva = relationship("Reserva")
    inscripcion = relationship("Inscripcion")


class Notificacion(Base):
    __tablename__ = "notificaciones"
    id_notificacion = Column(Integer, primary_key=True, autoincrement=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    titulo = Column(String(100), nullable=False)
    mensaje = Column(Text, nullable=False)
    fecha = Column(DateTime, nullable=False, default=datetime.utcnow)
    leida = Column(Boolean, nullable=False, default=False)

    usuario = relationship("Usuario")


class Valoracion(Base):
    __tablename__ = "valoraciones"
    id_valoracion = Column(Integer, primary_key=True, autoincrement=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    id_cancha = Column(Integer, ForeignKey("canchas.id_cancha"), nullable=False)
    puntuacion = Column(Integer, nullable=False)
    comentario = Column(Text)
    fecha = Column(DateTime, nullable=False, default=datetime.utcnow)

    usuario = relationship("Usuario")
    cancha = relationship("Cancha")


class Favorito(Base):
    __tablename__ = "favoritos"
    id_favorito = Column(Integer, primary_key=True, autoincrement=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    id_cancha = Column(Integer, ForeignKey("canchas.id_cancha"), nullable=False)
    fecha_agregado = Column(DateTime, nullable=False, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("id_usuario", "id_cancha", name="uq_favorito_usuario_cancha"),
    )

    usuario = relationship("Usuario")
    cancha = relationship("Cancha")


# ---------------------------------------------------------------------------
# Módulos que ya existían en el backend. Se conservan aunque aún no estén
# en las 18 tablas de la BD final.
# ---------------------------------------------------------------------------

class Propietario(Base):
    __tablename__ = "propietarios"
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    empresa = Column(String(150), nullable=True)
    nit = Column(String(50), nullable=True)
    telefono_contacto = Column(String(30), nullable=True)
    usuario = relationship("Usuario")


class Evento(Base):
    __tablename__ = "eventos"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(150), nullable=False)
    descripcion = Column(Text, nullable=True)
    cancha_id = Column(Integer, ForeignKey("canchas.id_cancha"), nullable=True)
    fecha = Column(Date, nullable=True)
    hora = Column(Time, nullable=True)
    tipo = Column(String(50), nullable=True)
    cancha = relationship("Cancha")


class Noticia(Base):
    __tablename__ = "noticias"
    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(200), nullable=False)
    contenido = Column(Text, nullable=False)
    autor_id = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=True)
    fecha_publicacion = Column(DateTime, default=datetime.utcnow)
    imagen_url = Column(String(255), nullable=True)
    autor = relationship("Usuario")


class Reporte(Base):
    __tablename__ = "reportes"
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    tipo = Column(String(50), nullable=True)
    descripcion = Column(Text, nullable=False)
    fecha = Column(DateTime, default=datetime.utcnow)
    estado = Column(String(30), default="abierto")
    usuario = relationship("Usuario")
