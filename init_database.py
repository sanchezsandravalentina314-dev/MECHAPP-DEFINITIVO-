"""
Script para inicializar la base de datos de MechApp con todas sus tablas y datos iniciales (Seed).
Ejecutar con: python init_database.py
"""
import os
import sys
from datetime import datetime, date, time

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from config.database import engine, SessionLocal, Base
from models.modelos import (
    Rol, Usuario, Ubicacion, Cancha, HorarioDisponible,
    Reserva, Torneo, Inscripcion, Equipo, EquipoJugador,
    InscripcionEquipo, Partido, Resultado, MetodoPago,
    Pago, Notificacion, Valoracion, Favorito,
    Propietario, Evento, Noticia, Reporte
)
from utils.security import hash_password

def inicializar_bd():
    print("=" * 50)
    print("   MECHAPP - Inicializador de Base de Datos")
    print("=" * 50)
    
    # 1. Crear todas las tablas
    print("\n[PASO 1] Creando tablas en PostgreSQL...")
    Base.metadata.create_all(bind=engine)
    print("   [OK] Tablas creadas / verificadas exitosamente.")

    db = SessionLocal()
    try:
        # 2. Roles del Sistema
        print("\n[PASO 2] Verificando Roles...")
        roles_data = [
            {"id_rol": 1, "nombre": "Administrador", "descripcion": "Control total del sistema MechApp", "estado": True},
            {"id_rol": 2, "nombre": "Jugador", "descripcion": "Usuario jugador para reservas y torneos", "estado": True},
            {"id_rol": 3, "nombre": "Propietario", "descripcion": "Administrador de canchas y clubes", "estado": True},
        ]
        for r_info in roles_data:
            rol_existente = db.query(Rol).filter(Rol.id_rol == r_info["id_rol"]).first()
            if not rol_existente:
                db.add(Rol(**r_info))
                print(f"   [+] Rol agregado: {r_info['nombre']}")
            else:
                print(f"   [=] Rol ya existente: {rol_existente.nombre}")
        db.commit()

        # 3. Métodos de Pago
        print("\n[PASO 3] Verificando Metodos de Pago...")
        metodos_data = [
            {"id_metodo_pago": 1, "nombre": "Efectivo", "descripcion": "Pago presencial en la cancha", "estado": True},
            {"id_metodo_pago": 2, "nombre": "Transferencia (Nequi / Daviplata)", "descripcion": "Pago digital mediante billetera movil", "estado": True},
            {"id_metodo_pago": 3, "nombre": "Tarjeta Debito / Credito", "descripcion": "Pago electronico con datafono o pasarela", "estado": True},
            {"id_metodo_pago": 4, "nombre": "PSE", "descripcion": "Pago en linea seguro PSE", "estado": True},
        ]
        for m_info in metodos_data:
            metodo_existente = db.query(MetodoPago).filter(MetodoPago.id_metodo_pago == m_info["id_metodo_pago"]).first()
            if not metodo_existente:
                db.add(MetodoPago(**m_info))
                print(f"   [+] Metodo de pago agregado: {m_info['nombre']}")
            else:
                print(f"   [=] Metodo de pago ya existente: {metodo_existente.nombre}")
        db.commit()

        # 4. Usuarios Iniciales
        print("\n[PASO 4] Verificando Usuarios Iniciales...")
        usuarios_data = [
            {
                "id_rol": 1,
                "nombre": "Administrador General",
                "documento": "1000000001",
                "correo": "admin@mechapp.com",
                "telefono": "3001234567",
                "contrasena": hash_password("123456"),
                "estado": True,
            },
            {
                "id_rol": 3,
                "nombre": "Carlos Propietario",
                "documento": "1000000002",
                "correo": "propietario@mechapp.com",
                "telefono": "3109876543",
                "contrasena": hash_password("123456"),
                "estado": True,
            },
            {
                "id_rol": 2,
                "nombre": "Juan Jugador",
                "documento": "1000000003",
                "correo": "jugador@mechapp.com",
                "telefono": "3155554433",
                "contrasena": hash_password("123456"),
                "estado": True,
            },
        ]
        for u_info in usuarios_data:
            user_existente = db.query(Usuario).filter(Usuario.correo == u_info["correo"]).first()
            if not user_existente:
                db.add(Usuario(**u_info))
                print(f"   [+] Usuario creado: {u_info['correo']} (clave: 123456)")
            else:
                print(f"   [=] Usuario ya existente: {user_existente.correo}")
        db.commit()

        # 5. Ubicaciones y Canchas de Prueba
        print("\n[PASO 5] Verificando Ubicaciones y Canchas de ejemplo...")
        admin_user = db.query(Usuario).filter(Usuario.correo == "admin@mechapp.com").first()
        prop_user = db.query(Usuario).filter(Usuario.correo == "propietario@mechapp.com").first()
        owner_id = prop_user.id_usuario if prop_user else (admin_user.id_usuario if admin_user else 1)

        if not db.query(Ubicacion).first():
            ubi = Ubicacion(
                nombre="Club Social y Deportivo El Tejo Mayor",
                direccion="Carrera 15 # 45-20",
                ciudad="Bogota D.C.",
                barrio="Teusaquillo",
                estado=True
            )
            db.add(ubi)
            db.commit()
            db.refresh(ubi)
            print(f"   [+] Ubicacion creada: {ubi.nombre}")

            cancha1 = Cancha(
                id_usuario=owner_id,
                id_ubicacion=ubi.id_ubicacion,
                nombre="Cancha Principal Los Campeones",
                descripcion="Cancha reglamentaria de tejo en arcilla profesional, iluminacion LED y zona de hidratacion.",
                capacidad=12,
                precio_hora=45000.00,
                estado=True
            )
            cancha2 = Cancha(
                id_usuario=owner_id,
                id_ubicacion=ubi.id_ubicacion,
                nombre="Cancha Mini Tejo El Porvenir",
                descripcion="Cancha de minitejo ideal para torneos rapidos y entrenamiento.",
                capacidad=8,
                precio_hora=30000.00,
                estado=True
            )
            db.add_all([cancha1, cancha2])
            db.commit()
            db.refresh(cancha1)
            db.refresh(cancha2)
            print(f"   [+] Canchas creadas: {cancha1.nombre}, {cancha2.nombre}")

            # Horarios de ejemplo para la cancha principal
            hoy = date.today()
            horarios = [
                HorarioDisponible(id_cancha=cancha1.id_cancha, fecha=hoy, hora_inicio=time(14, 0), hora_fin=time(16, 0), estado=True),
                HorarioDisponible(id_cancha=cancha1.id_cancha, fecha=hoy, hora_inicio=time(16, 0), hora_fin=time(18, 0), estado=True),
                HorarioDisponible(id_cancha=cancha1.id_cancha, fecha=hoy, hora_inicio=time(18, 0), hora_fin=time(20, 0), estado=True),
                HorarioDisponible(id_cancha=cancha1.id_cancha, fecha=hoy, hora_inicio=time(20, 0), hora_fin=time(22, 0), estado=True),
            ]
            db.add_all(horarios)
            db.commit()
            print("   [+] Horarios disponibles agregados para hoy")
        else:
            print("   [=] Ubicaciones y canchas ya existentes.")

        print("\n" + "=" * 50)
        print("   Base de datos inicializada con exito!")
        print("=" * 50)
        print("\nCredenciales de prueba disponibles:")
        print("   - Administrador: admin@mechapp.com       / 123456")
        print("   - Propietario:   propietario@mechapp.com / 123456")
        print("   - Jugador:       jugador@mechapp.com     / 123456")
        print("=" * 50)

    except Exception as e:
        db.rollback()
        print(f"   [ERROR] Error al inicializar datos: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    inicializar_bd()
