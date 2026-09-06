"""
Servicio de envío de correos electrónicos para MechApp.
Usa smtplib estándar de Python (sin dependencias externas).
Configuración en .env:
    EMAIL_ORIGEN=tu_correo@gmail.com
    EMAIL_PASSWORD=tu_contraseña_de_aplicacion
    EMAIL_NOMBRE=MechApp
"""
import smtplib
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from dotenv import load_dotenv

load_dotenv()

EMAIL_ORIGEN   = os.getenv("EMAIL_ORIGEN", "")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "")
EMAIL_NOMBRE   = os.getenv("EMAIL_NOMBRE", "MechApp - Tejo Colombiano")
SMTP_HOST      = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT      = int(os.getenv("SMTP_PORT", "587"))


def _enviar(destinatario: str, asunto: str, cuerpo_html: str) -> bool:
    """Función interna que abre conexión SMTP y envía el correo."""
    if not EMAIL_ORIGEN or not EMAIL_PASSWORD:
        print("⚠️  EMAIL_ORIGEN o EMAIL_PASSWORD no configurados en .env")
        return False
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = asunto
        msg["From"]    = f"{EMAIL_NOMBRE} <{EMAIL_ORIGEN}>"
        msg["To"]      = destinatario
        msg.attach(MIMEText(cuerpo_html, "html", "utf-8"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.login(EMAIL_ORIGEN, EMAIL_PASSWORD)
            server.sendmail(EMAIL_ORIGEN, destinatario, msg.as_string())
        print(f"✅ Correo enviado a {destinatario}: {asunto}")
        return True
    except Exception as e:
        print(f"❌ Error al enviar correo a {destinatario}: {e}")
        return False


# ─────────────────────────────────────────────
# PLANTILLAS DE CORREO
# ─────────────────────────────────────────────

def _base_html(titulo: str, contenido: str) -> str:
    """Plantilla base con estilo de MechApp (tema oscuro + naranja)."""
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
        .footer a {{ color:#ff5722; text-decoration:none; }}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎯 MechApp</h1>
          <p>Plataforma Digital del Tejo Colombiano</p>
        </div>
        <div class="body">
          <h2>{titulo}</h2>
          {contenido}
        </div>
        <div class="footer">
          <p>© 2024 MechApp · Deporte Nacional de Colombia · Ley 613 del 2000</p>
          <p>Si no solicitaste este correo, puedes ignorarlo.</p>
        </div>
      </div>
    </body>
    </html>
    """


# ─────────────────────────────────────────────
# CORREOS DISPONIBLES
# ─────────────────────────────────────────────

def enviar_bienvenida(correo: str, nombre: str) -> bool:
    """Correo de bienvenida al registrarse en MechApp."""
    contenido = f"""
    <p>Hola <strong>{nombre}</strong>, ¡bienvenido/a a MechApp! 🎉</p>
    <p>Tu cuenta ha sido creada exitosamente. Ya puedes explorar canchas,
       inscribirte en torneos y reservar tu espacio de juego.</p>
    <div class="info-box">
      <p><strong>Correo registrado:</strong> {correo}</p>
      <p><strong>Estado:</strong> Activo ✅</p>
    </div>
    <p>¡Que disfrutes el Tejo! 🏆</p>
    <a class="btn" href="http://localhost:5173/login">Iniciar sesión</a>
    """
    return _enviar(
        destinatario=correo,
        asunto="¡Bienvenido/a a MechApp! 🎯",
        cuerpo_html=_base_html("¡Ya eres parte de MechApp!", contenido)
    )


def enviar_recuperacion_contrasena(correo: str, nombre: str, token: str) -> bool:
    """Correo con enlace para restablecer contraseña."""
    enlace = f"http://localhost:5173/restablecer-contrasena?token={token}"
    contenido = f"""
    <p>Hola <strong>{nombre}</strong>,</p>
    <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en MechApp.</p>
    <p>Haz clic en el botón a continuación para crear una nueva contraseña.
       Este enlace es válido por <strong>30 minutos</strong>.</p>
    <a class="btn" href="{enlace}">Restablecer contraseña</a>
    <p style="font-size:13px;color:#888;">
      Si no solicitaste esto, ignora este correo. Tu contraseña no será cambiada.
    </p>
    <div class="info-box">
      <p><strong>Si el botón no funciona, copia este enlace:</strong></p>
      <p style="word-break:break-all;">{enlace}</p>
    </div>
    """
    return _enviar(
        destinatario=correo,
        asunto="Recuperar contraseña - MechApp 🔐",
        cuerpo_html=_base_html("Restablece tu contraseña", contenido)
    )


def enviar_confirmacion_reserva(
    correo: str, nombre: str,
    cancha: str, fecha: str, hora_inicio: str, hora_fin: str,
    precio: str
) -> bool:
    """Correo de confirmación cuando se hace una reserva."""
    contenido = f"""
    <p>Hola <strong>{nombre}</strong>,</p>
    <p>Tu reserva en MechApp ha sido confirmada exitosamente. ¡Nos vemos en la cancha! 🎯</p>
    <div class="info-box">
      <p><strong>Cancha:</strong> {cancha}</p>
      <p><strong>Fecha:</strong> {fecha}</p>
      <p><strong>Hora inicio:</strong> {hora_inicio}</p>
      <p><strong>Hora fin:</strong> {hora_fin}</p>
      <p><strong>Valor:</strong> {precio}</p>
    </div>
    <p>Recuerda llegar puntual. ¡Buena puntería! 🏆</p>
    <a class="btn" href="http://localhost:5173/mis-reservas">Ver mis reservas</a>
    """
    return _enviar(
        destinatario=correo,
        asunto="✅ Reserva confirmada - MechApp",
        cuerpo_html=_base_html("¡Tu reserva está confirmada!", contenido)
    )


def enviar_confirmacion_inscripcion(
    correo: str, nombre: str,
    torneo: str, equipo: str, fecha_inicio: str
) -> bool:
    """Correo de confirmación de inscripción a un torneo."""
    contenido = f"""
    <p>Hola <strong>{nombre}</strong>,</p>
    <p>¡Tu inscripción al torneo ha sido registrada exitosamente! ⚽🎯</p>
    <div class="info-box">
      <p><strong>Torneo:</strong> {torneo}</p>
      <p><strong>Equipo:</strong> {equipo}</p>
      <p><strong>Fecha de inicio:</strong> {fecha_inicio}</p>
    </div>
    <p>Prepara a tu equipo, que viene una gran competencia. ¡Mucho éxito!</p>
    <a class="btn" href="http://localhost:5173/torneos">Ver torneos</a>
    """
    return _enviar(
        destinatario=correo,
        asunto=f"🏆 Inscripción confirmada - {torneo}",
        cuerpo_html=_base_html("¡Inscripción al torneo confirmada!", contenido)
    )


def enviar_notificacion_admin(
    correo_admin: str, asunto: str, mensaje: str
) -> bool:
    """Correo de notificación general para el administrador."""
    contenido = f"""
    <p>{mensaje}</p>
    <a class="btn" href="http://localhost:5173/admin">Ir al panel de Admin</a>
    """
    return _enviar(
        destinatario=correo_admin,
        asunto=f"[MechApp Admin] {asunto}",
        cuerpo_html=_base_html(asunto, contenido)
    )
