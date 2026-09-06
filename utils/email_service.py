"""
Servicio de envío de correos electrónicos para MechApp.
Usa Resend (resend.com) - gratuito, sin configuración SMTP.
Configuración en .env:
    RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
    EMAIL_NOMBRE=MechApp - Tejo Colombiano
"""
import os
import json
import urllib.request
import urllib.error
from dotenv import load_dotenv

load_dotenv()

RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
EMAIL_NOMBRE   = os.getenv("EMAIL_NOMBRE", "MechApp - Tejo Colombiano")
# Con Resend en cuenta gratuita, el remitente debe ser onboarding@resend.dev
# hasta que verifiques tu dominio. Funciona perfecto para pruebas.
EMAIL_ORIGEN   = os.getenv("EMAIL_ORIGEN", "onboarding@resend.dev")


def _enviar(destinatario: str, asunto: str, cuerpo_html: str) -> bool:
    """Función interna que llama a la API de Resend para enviar el correo."""
    if not RESEND_API_KEY:
        print("[EMAIL] RESEND_API_KEY no configurado en .env")
        return False
    try:
        payload = json.dumps({
            "from": f"{EMAIL_NOMBRE} <{EMAIL_ORIGEN}>",
            "to": [destinatario],
            "subject": asunto,
            "html": cuerpo_html,
        }).encode("utf-8")

        req = urllib.request.Request(
            "https://api.resend.com/emails",
            data=payload,
            headers={
                "Authorization": f"Bearer {RESEND_API_KEY}",
                "Content-Type": "application/json",
            },
            method="POST",
        )
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode("utf-8"))
            print(f"[EMAIL] Correo enviado a {destinatario} | ID: {result.get('id')}")
            return True
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        print(f"[EMAIL] Error HTTP {e.code} al enviar a {destinatario}: {error_body}")
        return False
    except Exception as e:
        print(f"[EMAIL] Error inesperado al enviar a {destinatario}: {e}")
        return False


# ─────────────────────────────────────────────
# PLANTILLA BASE
# ─────────────────────────────────────────────

def _base_html(titulo: str, contenido: str) -> str:
    return f"""
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8"/>
      <style>
        body {{ margin:0; padding:0; background:#1a1a2e; font-family:'Segoe UI',Arial,sans-serif; color:#e0e0e0; }}
        .container {{ max-width:600px; margin:40px auto; background:#16213e; border-radius:16px; overflow:hidden; }}
        .header {{ background:linear-gradient(135deg,#ff5722,#e64a19); padding:32px 40px; text-align:center; }}
        .header h1 {{ margin:0; color:#fff; font-size:26px; letter-spacing:1px; }}
        .header p {{ margin:6px 0 0; color:rgba(255,255,255,0.85); font-size:13px; }}
        .body {{ padding:36px 40px; }}
        .body h2 {{ color:#ff5722; margin-top:0; }}
        .body p {{ line-height:1.7; color:#c0c0c0; }}
        .btn {{ display:inline-block; margin:24px 0; padding:14px 32px;
                background:#ff5722; color:#fff !important; text-decoration:none;
                border-radius:8px; font-weight:bold; font-size:15px; }}
        .info-box {{ background:#0f3460; border-left:4px solid #ff5722;
                     border-radius:8px; padding:16px 20px; margin:20px 0; }}
        .info-box p {{ margin:4px 0; color:#ddd; font-size:14px; }}
        .info-box strong {{ color:#ff5722; }}
        .footer {{ background:#0f3460; text-align:center; padding:20px;
                   font-size:12px; color:#666; }}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>MechApp</h1>
          <p>Plataforma Digital del Tejo Colombiano</p>
        </div>
        <div class="body">
          <h2>{titulo}</h2>
          {contenido}
        </div>
        <div class="footer">
          <p>2024 MechApp - Deporte Nacional de Colombia - Ley 613 del 2000</p>
        </div>
      </div>
    </body>
    </html>
    """


# ─────────────────────────────────────────────
# CORREOS DISPONIBLES
# ─────────────────────────────────────────────

def enviar_bienvenida(correo: str, nombre: str) -> bool:
    contenido = f"""
    <p>Hola <strong>{nombre}</strong>, bienvenido/a a MechApp!</p>
    <p>Tu cuenta ha sido creada exitosamente. Ya puedes explorar canchas,
       inscribirte en torneos y reservar tu espacio de juego.</p>
    <div class="info-box">
      <p><strong>Correo registrado:</strong> {correo}</p>
      <p><strong>Estado:</strong> Activo</p>
    </div>
    <p>Que disfrutes el Tejo!</p>
    <a class="btn" href="http://localhost:5173/login">Iniciar sesion</a>
    """
    return _enviar(correo, "Bienvenido/a a MechApp!", _base_html("Ya eres parte de MechApp!", contenido))


def enviar_recuperacion_contrasena(correo: str, nombre: str, token: str) -> bool:
    enlace = f"http://localhost:5173/restablecer-contrasena?token={token}"
    contenido = f"""
    <p>Hola <strong>{nombre}</strong>,</p>
    <p>Recibimos una solicitud para restablecer tu contrasena en MechApp.</p>
    <p>El enlace es valido por <strong>30 minutos</strong>.</p>
    <a class="btn" href="{enlace}">Restablecer contrasena</a>
    <div class="info-box">
      <p><strong>Si el boton no funciona, copia este enlace:</strong></p>
      <p style="word-break:break-all;">{enlace}</p>
    </div>
    """
    return _enviar(correo, "Recuperar contrasena - MechApp", _base_html("Restablece tu contrasena", contenido))


def enviar_confirmacion_reserva(
    correo: str, nombre: str,
    cancha: str, fecha: str, hora_inicio: str, hora_fin: str, precio: str
) -> bool:
    contenido = f"""
    <p>Hola <strong>{nombre}</strong>,</p>
    <p>Tu reserva ha sido confirmada exitosamente. Nos vemos en la cancha!</p>
    <div class="info-box">
      <p><strong>Cancha:</strong> {cancha}</p>
      <p><strong>Fecha:</strong> {fecha}</p>
      <p><strong>Hora inicio:</strong> {hora_inicio}</p>
      <p><strong>Hora fin:</strong> {hora_fin}</p>
      <p><strong>Valor:</strong> {precio}</p>
    </div>
    <a class="btn" href="http://localhost:5173/mis-reservas">Ver mis reservas</a>
    """
    return _enviar(correo, "Reserva confirmada - MechApp", _base_html("Tu reserva esta confirmada!", contenido))


def enviar_confirmacion_inscripcion(
    correo: str, nombre: str, torneo: str, equipo: str, fecha_inicio: str
) -> bool:
    contenido = f"""
    <p>Hola <strong>{nombre}</strong>,</p>
    <p>Tu inscripcion al torneo ha sido registrada exitosamente!</p>
    <div class="info-box">
      <p><strong>Torneo:</strong> {torneo}</p>
      <p><strong>Equipo:</strong> {equipo}</p>
      <p><strong>Fecha de inicio:</strong> {fecha_inicio}</p>
    </div>
    <a class="btn" href="http://localhost:5173/torneos">Ver torneos</a>
    """
    return _enviar(correo, f"Inscripcion confirmada - {torneo}", _base_html("Inscripcion al torneo confirmada!", contenido))


def enviar_notificacion_admin(correo_admin: str, asunto: str, mensaje: str) -> bool:
    contenido = f"""
    <p>{mensaje}</p>
    <a class="btn" href="http://localhost:5173/admin">Ir al panel de Admin</a>
    """
    return _enviar(correo_admin, f"[MechApp Admin] {asunto}", _base_html(asunto, contenido))
