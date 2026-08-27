"""
Punto de entrada de la API de MechApp.
Ejecutar desde App/Backend con:
    uvicorn main:app --reload
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config.settings import settings
from config.database import init_db
from middleware.error_handler import register_error_handlers

from routes import (
    auth_route,
    roles_route,
    usuarios_route,
    ubicaciones_route,
    canchas_route,
    horarios_route,
    reservas_route,
    torneos_route,
    inscripciones_route,
    equipos_route,
    equipo_jugador_route,
    inscripcion_equipos_route,
    partidas_route,
    resultados_route,
    metodos_pago_route,
    pagos_route,
    notificaciones_route,
    valoraciones_route,
    favoritos_route,
    # Módulos adicionales conservados del backend actual:
    propietarios_route,
    eventos_route,
    noticias_route,
    reportes_route,
)

app = FastAPI(
    title=settings.APP_NAME,
    description="API para la digitalización de la gestión del tejo (Turmequé).",
    version="2.0.0",
)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_error_handlers(app)

for module in (
    auth_route, roles_route, usuarios_route, ubicaciones_route, canchas_route,
    horarios_route, reservas_route, torneos_route, inscripciones_route,
    equipos_route, equipo_jugador_route, inscripcion_equipos_route,
    partidas_route, resultados_route, metodos_pago_route, pagos_route,
    notificaciones_route, valoraciones_route, favoritos_route,
    propietarios_route, eventos_route, noticias_route, reportes_route,
):
    app.include_router(module.router)

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/")
def root():
    return {"mensaje": "MechApp API funcionando correctamente 🎯"}

@app.get("/health")
def health():
    return {"status": "ok"}
