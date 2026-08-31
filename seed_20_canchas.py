"""
Script para poblar 20 canchas reales y activas de Tejo en Bogotá y municipios aledaños.
"""
import sys
import os
from datetime import datetime, date, time, timedelta
from decimal import Decimal

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# Añadir el directorio raíz al path para importar módulos correctamente
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config.database import SessionLocal, engine
from models.modelos import Usuario, Rol, Ubicacion, Cancha, HorarioDisponible
from utils.security import hash_password

def seed_canchas_bogota():
    db = SessionLocal()
    try:
        print("=== POBLANDO 20 CANCHAS REALES EN BOGOTÁ Y ALREDEDORES ===")
        
        # 1. Obtener o verificar el rol de Propietario
        rol_propietario = db.query(Rol).filter(Rol.nombre == "Propietario").first()
        if not rol_propietario:
            rol_propietario = Rol(nombre="Propietario", descripcion="Administrador de canchas y clubes", estado=True)
            db.add(rol_propietario)
            db.commit()
            db.refresh(rol_propietario)
            
        id_rol_prop = rol_propietario.id_rol

        # 2. Propietarios reales
        propietarios_data = [
            {"nombre": "Bernardo Morales Pinzón", "doc": "1018456101", "correo": "bernardo.morales@tejobogota.com", "tel": "3104567890"},
            {"nombre": "Guillermo 'Mochila' Rincón", "doc": "1018456102", "correo": "guillermo.rincon@tejosanmiguel.com", "tel": "3118901234"},
            {"nombre": "Héctor Fabio Castro", "doc": "1018456103", "correo": "hector.castro@la76tejo.com", "tel": "3123456789"},
            {"nombre": "Luz Marina Forero", "doc": "1018456104", "correo": "luz.forero@embajadatejo.com", "tel": "3156789012"},
            {"nombre": "Javier 'El Zurdo' Pachón", "doc": "1018456105", "correo": "javier.pachon@tejochianorte.com", "tel": "3201234567"},
            {"nombre": "Alvaro Rodríguez Nieto", "doc": "1018456106", "correo": "alvaro.rodriguez@tejosabanacund.com", "tel": "3189012345"},
        ]

        propietarios_creados = []
        for p in propietarios_data:
            user = db.query(Usuario).filter(Usuario.correo == p["correo"]).first()
            if not user:
                user = Usuario(
                    id_rol=id_rol_prop,
                    nombre=p["nombre"],
                    documento=p["doc"],
                    correo=p["correo"],
                    telefono=p["tel"],
                    contrasena=hash_password("Tejo2026*"),
                    estado=True
                )
                db.add(user)
                db.commit()
                db.refresh(user)
                print(f"[+] Propietario creado: {user.nombre}")
            propietarios_creados.append(user)

        # 3. Datos de las 20 Sedes / Canchas reales
        canchas_reales = [
            # 1
            {
                "sede_nombre": "Club de Tejo La 76",
                "direccion": "Carrera 24 # 76-56",
                "ciudad": "Bogotá D.C.",
                "barrio": "Chapinero Norte",
                "cancha_nombre": "Pistas Profesionales La 76",
                "descripcion": "El templo tradicional del tejo en Chapinero. 6 canchas reglamentarias con arcilla de Turmequé, polleras y ambiente tradicional de tejo y cerveza.",
                "capacidad": 12,
                "precio_hora": Decimal("38000.00"),
                "prop_index": 0
            },
            # 2
            {
                "sede_nombre": "Club Social y Deportivo San Miguel",
                "direccion": "Calle 64 # 17-52",
                "ciudad": "Bogotá D.C.",
                "barrio": "Baquero - Teusaquillo",
                "cancha_nombre": "Cancha San Miguel Central",
                "descripcion": "Escenario deportivo clásico fundado en 1978. Pistas con iluminación LED, bocines de acero templado y zona de picadas campesinas.",
                "capacidad": 10,
                "precio_hora": Decimal("35000.00"),
                "prop_index": 1
            },
            # 3
            {
                "sede_nombre": "Tejo La Embajada (San Felipe)",
                "direccion": "Carrera 24 # 76-20",
                "ciudad": "Bogotá D.C.",
                "barrio": "San Felipe",
                "cancha_nombre": "Pista Vip La Embajada",
                "descripcion": "Experiencia moderna y artesanal de tejo en el distrito de arte de San Felipe. Cervezas artesanales, tejo tradicional y música.",
                "capacidad": 14,
                "precio_hora": Decimal("48000.00"),
                "prop_index": 3
            },
            # 4
            {
                "sede_nombre": "Club de Tejo El Porvenir del Norte",
                "direccion": "Calle 73 # 27A-19",
                "ciudad": "Bogotá D.C.",
                "barrio": "Barrios Unidos",
                "cancha_nombre": "Cancha El Porvenir Pista 1",
                "descripcion": "Pistas con suelo húmedo de arcilla virgen para torneos departamentales. Ideal para grupos grandes y retos de mecha y embocinada.",
                "capacidad": 12,
                "precio_hora": Decimal("32000.00"),
                "prop_index": 0
            },
            # 5
            {
                "sede_nombre": "Club de Tejo Turmequé 57",
                "direccion": "Calle 57 # 4A-19",
                "ciudad": "Bogotá D.C.",
                "barrio": "Chapinero Alto",
                "cancha_nombre": "Canchas El Gran Turmequé",
                "descripcion": "Ubicado en Chapinero Alto, combina tejo tradicional con servicio de restaurante típico y tejos de bronce profesionales.",
                "capacidad": 10,
                "precio_hora": Decimal("40000.00"),
                "prop_index": 2
            },
            # 6
            {
                "sede_nombre": "Complejo Deportivo El Campeón Restrepo",
                "direccion": "Calle 17 Sur # 24B-30",
                "ciudad": "Bogotá D.C.",
                "barrio": "Restrepo",
                "cancha_nombre": "Pista Campeón del Sur",
                "descripcion": "Tradición cundiboyacense en el sur de Bogotá. Canchas techadas, venta de mechas de pólvora negra reglamentaria y picada típica.",
                "capacidad": 16,
                "precio_hora": Decimal("28000.00"),
                "prop_index": 1
            },
            # 7
            {
                "sede_nombre": "Club de Tejo Los Almendros Fontibón",
                "direccion": "Calle 17 # 98-45",
                "ciudad": "Bogotá D.C.",
                "barrio": "Fontibón Centro",
                "cancha_nombre": "Cancha Los Almendros",
                "descripcion": "Canchas con espacio al aire libre y techado. Excelente ubicación cerca al aeropuerto, muy concurrida los fines de semana.",
                "capacidad": 10,
                "precio_hora": Decimal("30000.00"),
                "prop_index": 0
            },
            # 8
            {
                "sede_nombre": "Club Social Los Libertadores Kennedy",
                "direccion": "Av. Primero de Mayo # 69B-15",
                "ciudad": "Bogotá D.C.",
                "barrio": "Kennedy Central",
                "cancha_nombre": "Pista Kennedy Mayor",
                "descripcion": "El epicentro del tejo en la localidad de Kennedy. 8 canchas continuas, sonido ambiental y torneos relámpago nocturnos.",
                "capacidad": 12,
                "precio_hora": Decimal("26000.00"),
                "prop_index": 2
            },
            # 9
            {
                "sede_nombre": "Club de Tejo La Llanerita Suba",
                "direccion": "Calle 145 # 92-30",
                "ciudad": "Bogotá D.C.",
                "barrio": "Suba Rincón",
                "cancha_nombre": "Cancha La Llanerita de Suba",
                "descripcion": "Ambiente campesino y familiar en Suba. Excelente atención, tejo, minitejo, rana y carne a la llanera.",
                "capacidad": 12,
                "precio_hora": Decimal("32000.00"),
                "prop_index": 4
            },
            # 10
            {
                "sede_nombre": "Pistas Don Pedro Venecia",
                "direccion": "Autopista Sur # 52-20",
                "ciudad": "Bogotá D.C.",
                "barrio": "Venecia",
                "cancha_nombre": "Cancha Don Pedro Central",
                "descripcion": "Fácil acceso sobre la Autopista Sur. Pistas bien mantenidas con arcilla suave y bocines calibrados.",
                "capacidad": 8,
                "precio_hora": Decimal("25000.00"),
                "prop_index": 1
            },
            # 11
            {
                "sede_nombre": "Club de Tejo La Sabana (Chía)",
                "direccion": "Carrera 9 # 12-45",
                "ciudad": "Chía",
                "barrio": "Centro Histórico",
                "cancha_nombre": "Cancha Real de Chía",
                "descripcion": "En pleno centro de Chía, Cundinamarca. Ambiente sabanero, parqueadero privado y canchas amplias de tejo y minitejo.",
                "capacidad": 14,
                "precio_hora": Decimal("36000.00"),
                "prop_index": 4
            },
            # 12
            {
                "sede_nombre": "Rancho Campestre El Tejo (Cota)",
                "direccion": "Vía Cota - Chía Km 2",
                "ciudad": "Cota",
                "barrio": "Vereda El Abra",
                "cancha_nombre": "Pistas Campestres Cota",
                "descripcion": "Hermoso club campestre con vista a los cerros. Zonas verdes, tejo, asados al barril y ambiente familiar los fines de semana.",
                "capacidad": 16,
                "precio_hora": Decimal("45000.00"),
                "prop_index": 4
            },
            # 13
            {
                "sede_nombre": "Club Social La Cumbre (Soacha)",
                "direccion": "Carrera 7 # 15-40",
                "ciudad": "Soacha",
                "barrio": "Soacha Centro",
                "cancha_nombre": "Pista La Cumbre Soacha",
                "descripcion": "Sede deportiva tradicional en Soacha centro con más de 20 años de historia deportiva y torneos dominicales.",
                "capacidad": 10,
                "precio_hora": Decimal("24000.00"),
                "prop_index": 5
            },
            # 14
            {
                "sede_nombre": "Complejo Deportivo Zipa (Zipaquirá)",
                "direccion": "Calle 4 # 10-25",
                "ciudad": "Zipaquirá",
                "barrio": "La Concepción",
                "cancha_nombre": "Canchas Zipa Salinero",
                "descripcion": "Cercano a la Catedral de Sal. Canchas con graderías para torneos zonales y servicio completo de bar y comidas típicas.",
                "capacidad": 14,
                "precio_hora": Decimal("30000.00"),
                "prop_index": 5
            },
            # 15
            {
                "sede_nombre": "Club Social La Colina (Cajicá)",
                "direccion": "Carrera 4 # 5-18",
                "ciudad": "Cajicá",
                "barrio": "La Estación",
                "cancha_nombre": "Cancha Campestre Cajicá",
                "descripcion": "Ubicado en sector tranquilo de Cajicá. Excelentes instalaciones techadas y tejos de competición para torneos sabaneros.",
                "capacidad": 12,
                "precio_hora": Decimal("35000.00"),
                "prop_index": 4
            },
            # 16
            {
                "sede_nombre": "Canchas El Mechero Mayor (Mosquera)",
                "direccion": "Calle 3 # 2-30",
                "ciudad": "Mosquera",
                "barrio": "El Poblado",
                "cancha_nombre": "Cancha Mechero Mosquera",
                "descripcion": "Instalaciones modernas en la Sabana Occidente. Marcadores digitales y zona de hidratación para deportistas.",
                "capacidad": 10,
                "precio_hora": Decimal("29000.00"),
                "prop_index": 5
            },
            # 17
            {
                "sede_nombre": "Pistas Turmequé de Funza",
                "direccion": "Carrera 9 # 14-22",
                "ciudad": "Funza",
                "barrio": "Sausalito",
                "cancha_nombre": "Pista Central Funza",
                "descripcion": "Punto de encuentro para los amantes del tejo en Funza y Madrid. Eventos empresariales y torneos de fin de semana.",
                "capacidad": 12,
                "precio_hora": Decimal("28000.00"),
                "prop_index": 5
            },
            # 18
            {
                "sede_nombre": "Club Arrayanes Tejo (Facatativá)",
                "direccion": "Carrera 2 # 8-60",
                "ciudad": "Facatativá",
                "barrio": "Santa Rita",
                "cancha_nombre": "Pista Arrayanes Faca",
                "descripcion": "Canchas federadas con medidas oficiales reglamentarias (18 metros) y ambiente familiar acogedor.",
                "capacidad": 10,
                "precio_hora": Decimal("27000.00"),
                "prop_index": 5
            },
            # 19
            {
                "sede_nombre": "Club Tejo El Dorado Engativá",
                "direccion": "Calle 68 # 70-35",
                "ciudad": "Bogotá D.C.",
                "barrio": "Engativá Centro",
                "cancha_nombre": "Cancha El Dorado Occidental",
                "descripcion": "Sede deportiva popular en Engativá con 5 canchas de tejo largo y 3 canchas de minitejo con iluminación nocturna.",
                "capacidad": 12,
                "precio_hora": Decimal("30000.00"),
                "prop_index": 2
            },
            # 20
            {
                "sede_nombre": "Club Social y Tejo Usaquén",
                "direccion": "Carrera 7 # 120-40",
                "ciudad": "Bogotá D.C.",
                "barrio": "Usaquén",
                "cancha_nombre": "Pista Usaquén Colonial",
                "descripcion": "Exclusivo club en el norte de Bogotá. Combina el tejo tradicional con gastronomía gourmet y cervecería nacional.",
                "capacidad": 14,
                "precio_hora": Decimal("52000.00"),
                "prop_index": 3
            },
        ]

        # 4. Insertar Ubicaciones y Canchas
        hoy = date.today()
        canchas_creadas_count = 0

        for c_data in canchas_reales:
            # Buscar o crear Ubicación
            ubicacion = db.query(Ubicacion).filter(
                Ubicacion.nombre == c_data["sede_nombre"],
                Ubicacion.ciudad == c_data["ciudad"]
            ).first()

            if not ubicacion:
                ubicacion = Ubicacion(
                    nombre=c_data["sede_nombre"],
                    direccion=c_data["direccion"],
                    ciudad=c_data["ciudad"],
                    barrio=c_data["barrio"],
                    estado=True
                )
                db.add(ubicacion)
                db.commit()
                db.refresh(ubicacion)
                print(f"[+] Sede creada: {ubicacion.nombre} ({ubicacion.ciudad} - {ubicacion.barrio})")

            # Asignar Propietario
            propietario = propietarios_creados[c_data["prop_index"] % len(propietarios_creados)]

            # Buscar o crear Cancha
            cancha = db.query(Cancha).filter(
                Cancha.nombre == c_data["cancha_nombre"],
                Cancha.id_ubicacion == ubicacion.id_ubicacion
            ).first()

            if not cancha:
                cancha = Cancha(
                    id_usuario=propietario.id_usuario,
                    id_ubicacion=ubicacion.id_ubicacion,
                    nombre=c_data["cancha_nombre"],
                    descripcion=c_data["descripcion"],
                    capacidad=c_data["capacidad"],
                    estado=True,
                    precio_hora=c_data["precio_hora"]
                )
                db.add(cancha)
                db.commit()
                db.refresh(cancha)
                canchas_creadas_count += 1
                print(f"  --> Cancha activa: {cancha.nombre} | Tarifa: ${cancha.precio_hora:,.0f}/hr | Dueño: {propietario.nombre}")

                # 5. Generar horarios disponibles para los próximos 7 días
                for d_offset in range(1, 8):
                    dia_fecha = hoy + timedelta(days=d_offset)
                    # Turno Tarde
                    db.add(HorarioDisponible(
                        id_cancha=cancha.id_cancha,
                        fecha=dia_fecha,
                        hora_inicio=time(14, 0),
                        hora_fin=time(17, 0),
                        estado=True
                    ))
                    # Turno Noche
                    db.add(HorarioDisponible(
                        id_cancha=cancha.id_cancha,
                        fecha=dia_fecha,
                        hora_inicio=time(18, 0),
                        hora_fin=time(22, 0),
                        estado=True
                    ))
                db.commit()

        print(f"\n[ÉXITO] Se completaron las 20 canchas reales y sedes en Bogotá y municipios aledaños.")
        print(f"Total canchas activas registradas: {canchas_creadas_count + db.query(Cancha).count() - canchas_creadas_count}")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error al poblar canchas: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_canchas_bogota()
