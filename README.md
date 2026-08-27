# MechApp — Backend (FastAPI + PostgreSQL)

API REST para la digitalización de la gestión del tejo (Turmequé): usuarios,
propietarios, canchas, equipos, torneos, inscripciones, partidas, resultados,
eventos, noticias, notificaciones, pagos, favoritos y reportes.

## 1. Requisitos
- Python 3.10+
- PostgreSQL corriendo (local o remoto)

## 2. Instalación

```bash
cd App/Backend
python -m venv venv
source venv/bin/activate        # En Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## 3. Configurar variables de entorno

Copia el archivo de ejemplo y ajusta tus datos reales de PostgreSQL:

```bash
cp .env.example .env
```

Edita `.env`:
```
DATABASE_URL=postgresql://usuario:password@localhost:5432/mechapp_db
SECRET_KEY=una-clave-larga-y-secreta
```

> Antes de correr la app, crea la base de datos vacía en PostgreSQL:
> `CREATE DATABASE mechapp_db;`
> Las tablas se crean solas al iniciar la aplicación (no necesitas escribir SQL).

## 4. Ejecutar el servidor

```bash
uvicorn main:app --reload
```

La API queda disponible en: http://127.0.0.1:8000
Documentación interactiva (Swagger) automática en: http://127.0.0.1:8000/docs

## 5. Estructura del proyecto

```
App/Backend/
├── main.py                 # Punto de entrada, registra todos los routers
├── config/
│   ├── database.py         # Conexión a PostgreSQL (SQLAlchemy)
│   └── settings.py         # Variables de entorno
├── models/
│   └── modelos.py          # Todas las tablas (SQLAlchemy ORM)
├── schemas/                # Validación de datos de entrada/salida (Pydantic)
├── services/                # Lógica de acceso a datos (una por módulo)
├── controllers/             # Lógica de negocio y manejo de errores
├── routes/                  # Endpoints HTTP (un archivo por módulo)
├── middleware/
│   └── error_handler.py    # Manejo centralizado de errores
└── utils/
    ├── security.py          # Hash de contraseñas y JWT
    └── dependencies.py      # Autenticación (obtener usuario actual)
```

Cada módulo de negocio (canchas, equipos, torneos, etc.) sigue siempre el
mismo patrón en 4 capas: **schema → service → controller → route**, así que
una vez entiendes uno, entiendes todos.

## 6. Autenticación

- `POST /api/auth/registro` — crea un usuario y devuelve un token
- `POST /api/auth/login` — inicia sesión y devuelve un token

Para los endpoints que requieran usuario autenticado, envía el header:
```
Authorization: Bearer <token>
```

(Por ahora los endpoints CRUD de cada módulo están abiertos para que puedas
probar todo rápido. Cuando tengas tiempo, protege los que necesiten rol de
`admin` o `propietario` usando `Depends(require_role("admin"))` — está listo
en `utils/dependencies.py`, solo hay que añadirlo a la ruta.)

## 7. Endpoints disponibles por módulo

Todos los módulos (`canchas`, `equipos`, `torneos`, `inscripciones`,
`partidas`, `resultados`, `eventos`, `noticias`, `notificaciones`, `pagos`,
`favoritos`, `reportes`, `propietarios`, `usuarios`) exponen:

```
GET    /api/{modulo}/          -> listar todos
GET    /api/{modulo}/{id}      -> obtener uno
POST   /api/{modulo}/          -> crear
PUT    /api/{modulo}/{id}      -> actualizar
DELETE /api/{modulo}/{id}      -> eliminar
```

## 8. Nota sobre nombres de archivo

Tu estructura original tenía `usuario_controller.py` / `usuario_route.py`
(singular) y también `partida_controllers.py` junto con `partidas_controller.py`.
Para evitar duplicar tablas/lógica dejé un único módulo `usuarios` (plural,
coincide con la tabla `usuarios`) y un único módulo `partidas`. Si tu frontend
ya llama a las rutas en singular, es un cambio de una línea en `main.py` y en
el `prefix` del router correspondiente — dime y lo ajusto.

## 9. Probado

Este backend fue probado end-to-end (registro, login, y CRUD completo) antes
de entregarlo. Debería funcionar apenas configures tu `DATABASE_URL`.
