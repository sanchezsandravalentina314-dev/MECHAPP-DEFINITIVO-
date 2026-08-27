"""
Script de configuración inicial de MechApp para el SENA.
Ejecutar con: python setup_sena.py
"""
import os
import sys
import subprocess

print("=" * 50)
print("   MECHAPP - Configuración Inicial para SENA")
print("=" * 50)

# 1. Pedir contraseña de PostgreSQL
print("\n📌 PASO 1: Datos de PostgreSQL del SENA")
pg_user = input("   Usuario PostgreSQL (normalmente 'postgres'): ").strip() or "postgres"
pg_pass = input("   Contraseña de PostgreSQL: ").strip()
pg_port = input("   Puerto (normalmente 5432, ENTER para aceptar): ").strip() or "5432"
db_name = "MechApp"

# 2. Crear archivo .env
print("\n📌 PASO 2: Creando archivo .env ...")
env_content = f"""DATABASE_URL=postgresql://{pg_user}:{pg_pass}@localhost:{pg_port}/{db_name}
SECRET_KEY=mechapp_clave_secreta_2024
ACCESS_TOKEN_EXPIRE_MINUTES=60
"""
with open(".env", "w") as f:
    f.write(env_content)
print("   ✅ .env creado correctamente")

# 3. Crear base de datos
print(f"\n📌 PASO 3: Creando base de datos '{db_name}' ...")
try:
    import psycopg2
    conn = psycopg2.connect(
        host="localhost",
        port=pg_port,
        user=pg_user,
        password=pg_pass,
        database="postgres"
    )
    conn.autocommit = True
    cur = conn.cursor()
    cur.execute(f"SELECT 1 FROM pg_database WHERE datname = '{db_name}'")
    if not cur.fetchone():
        cur.execute(f'CREATE DATABASE "{db_name}"')
        print(f"   ✅ Base de datos '{db_name}' creada")
    else:
        print(f"   ✅ Base de datos '{db_name}' ya existe")
    cur.close()
    conn.close()
except Exception as e:
    print(f"   ⚠️  No se pudo crear la BD automáticamente: {e}")
    print(f"   👉 Créala manualmente en pgAdmin: CREATE DATABASE \"{db_name}\";")

# 4. Crear tablas e insertar datos iniciales
print("\n📌 PASO 4: Creando tablas y datos iniciales ...")
try:
    os.environ["DATABASE_URL"] = f"postgresql+psycopg2://{pg_user}:{pg_pass}@localhost:{pg_port}/{db_name}"
    from config.database import engine, SessionLocal, Base
    from models.modelos import Rol, Usuario, Ubicacion, Cancha

    Base.metadata.create_all(bind=engine)
    print("   ✅ Tablas creadas correctamente")

    db = SessionLocal()

    # Roles
    if not db.query(Rol).first():
        roles = [
            Rol(id_rol=1, nombre="Administrador"),
            Rol(id_rol=2, nombre="Jugador"),
            Rol(id_rol=3, nombre="Propietario"),
        ]
        db.add_all(roles)
        db.commit()
        print("   ✅ Roles creados: Administrador, Jugador, Propietario")

    # Usuarios de prueba
    if not db.query(Usuario).filter(Usuario.correo == "admin@mechapp.com").first():
        import hashlib, hmac
        def simple_hash(password):
            import base64
            salt = b"mechapp_salt_2024"
            h = hmac.new(salt, password.encode(), hashlib.sha256).digest()
            return "sha256$" + salt.hex() + "$" + h.hex()

        try:
            import bcrypt
            def make_hash(p): return bcrypt.hashpw(p.encode(), bcrypt.gensalt()).decode()
        except:
            make_hash = simple_hash

        admin = Usuario(id_rol=1, nombre="Administrador MechApp", documento="1015404883",
                        correo="admin@mechapp.com", telefono="3109876543",
                        contrasena=make_hash("123456"), estado=True)
        jugador = Usuario(id_rol=2, nombre="Carlos Mendoza", documento="1023456789",
                          correo="carlos@gmail.com", telefono="3123456789",
                          contrasena=make_hash("123456"), estado=True)
        db.add_all([admin, jugador])
        db.commit()
        print("   ✅ Usuarios creados: admin@mechapp.com / carlos@gmail.com (contraseña: 123456)")

    # Ubicacion y Cancha de ejemplo
    if not db.query(Ubicacion).first():
        ubi = Ubicacion(nombre="Club El Porvenir", direccion="Calle 22 # 14-35",
                        ciudad="Bogotá D.C.", barrio="Centro", estado=True)
        db.add(ubi)
        db.commit()
        db.refresh(ubi)
        cancha = Cancha(id_usuario=1, id_ubicacion=ubi.id_ubicacion,
                        nombre="Club de Tejo El Porvenir",
                        descripcion="8 canchas reglamentarias de arcilla.",
                        capacidad=8, precio_hora=35000, estado=True)
        db.add(cancha)
        db.commit()
        print("   ✅ Ubicación y cancha de ejemplo creadas")

    db.close()

except Exception as e:
    print(f"   ❌ Error: {e}")
    print("   👉 Verifica que la contraseña de PostgreSQL sea correcta")
    sys.exit(1)

print("\n" + "=" * 50)
print("   ✅ ¡MechApp lista para usar!")
print("=" * 50)
print("\n🚀 Ahora ejecuta en OTRA terminal:")
print("   uvicorn main:app --reload --port 8000")
print("\n🌐 Y el Frontend en otra terminal:")
print("   npx vite  (desde la carpeta MECHAPP-DEFINITIVO-)")
print("\n🔑 Login en http://localhost:5173")
print("   Admin:   admin@mechapp.com  /  123456")
print("   Jugador: carlos@gmail.com   /  123456")
print("=" * 50)
