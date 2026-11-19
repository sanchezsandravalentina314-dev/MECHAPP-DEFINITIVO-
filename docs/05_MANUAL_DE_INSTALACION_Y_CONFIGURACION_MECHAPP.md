# MANUAL DE INSTALACIÓN Y CONFIGURACIÓN TÉCNICA - MECHAPP
**Guía Paso a Paso para Despliegue Local y Puesta en Producción**

---

### INFORMACIÓN TÉCNICA DEL PROYECTO
- **Aplicativo:** MechApp (Backend FastAPI + Frontend React + PostgreSQL)
- **Centro:** Centro de Gestión de Mercados, Logística y Tecnologías de la Información - SENA
- **Programa:** Análisis y Desarrollo de Software (ADSO) - Ficha: 3407178
- **Equipo de Desarrollo:** Sandra Valentina Sánchez, Geraldine Juliana Rico
- **Instructor Técnico:** Daniel López
- **Versión:** 2.0
- **Fecha:** Noviembre de 2026

---

## 1. REQUISITOS PREVIOS DEL SISTEMA

Antes de iniciar la instalación de MechApp, asegúrese de contar con las siguientes herramientas instaladas en su estación de trabajo o servidor:

### 1.1 Requisitos de Hardware
- **Procesador:** CPU de 64 bits con al menos 2 núcleos (Intel Core i3 / AMD Ryzen 3 o superior).
- **Memoria RAM:** Mínimo 4 GB (Recomendado 8 GB o más).
- **Almacenamiento:** Mínimo 2 GB de espacio libre en disco.

### 1.2 Requisitos de Software
1. **Sistema Operativo:** Windows 10/11, macOS Ventura/Sonoma o Linux (Ubuntu 20.04+ / Debian 11+).
2. **Python:** Versión **3.10** o superior (verificar con `python --version`).
3. **Node.js:** Versión **18.x LTS** o superior (verificar con `node -v` y `npm -v`).
4. **PostgreSQL:** Versión **14.x** o superior (instalado con pgAdmin 4).
5. **Git:** Para clonación de código fuente y control de versiones.

---

## 2. CONFIGURACIÓN DEL MOTOR DE BASE DE DATOS (POSTGRESQL)

### Paso 2.1: Verificar Servicio de PostgreSQL
Asegúrese de que el servicio de PostgreSQL se encuentra en ejecución.
- En Windows: Abrir `services.msc` y verificar que el servicio `postgresql-x64-xx` esté en estado *En ejecución*.

### Paso 2.2: Crear la Base de Datos "MechApp"
Puede crearla mediante la interfaz gráfica de **pgAdmin 4** o mediante la consola de comandos de PostgreSQL (`psql`):

```sql
-- Ejecutar en la consola de PostgreSQL (puerto 5432 o 5433 según su instalación):
CREATE DATABASE "MechApp"
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    CONNECTION LIMIT = -1;
```

---

## 3. INSTALACIÓN Y PUESTA EN MARCHA DEL BACKEND (FASTAPI)

El backend de MechApp se encuentra estructurado en el directorio `MECHAPP-BACKEND`.

### Paso 3.1: Navegar al Directorio del Backend
```bash
cd "MECHAPP-BACKEND"
```

### Paso 3.2: Crear y Activar el Entorno Virtual (venv)
Es una buena práctica aislar las librerías de Python en un entorno virtual propio:
```powershell
# En Windows (PowerShell):
python -m venv venv
.\venv\Scripts\activate

# En Linux / macOS:
python3 -m venv venv
source venv/bin/activate
```

### Paso 3.3: Instalar Dependencias del Backend
Instale los paquetes requeridos usando el archivo `requirements.txt`:
```powershell
pip install -r requirements.txt
```
*Librerías principales instaladas: FastAPI, Uvicorn, SQLAlchemy, psycopg2-binary, Pydantic, Bcrypt, Python-Jose, Resend, Python-Multipart y Python-Dotenv.*

### Paso 3.4: Configurar el Archivo de Variables de Entorno (`.env`)
En la raíz de `MECHAPP-BACKEND`, verifique o edite el archivo `.env` con sus credenciales de base de datos:

```ini
# Configuración de Base de Datos PostgreSQL
DATABASE_URL=postgresql://postgres:1983@localhost:5433/MechApp

# Clave Secreta para Cifrado de Tokens JWT (256 bits)
SECRET_KEY=e8f3b2a9d7c410582fb6e1c940291a74d5386b0f19c4d8e723a1095cb4f86d21
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Configuración de Correo Electrónico (Resend API)
RESEND_API_KEY=re_TU_API_KEY_AQUI
EMAIL_NOMBRE=MechApp - Tejo Colombiano
EMAIL_ORIGEN=onboarding@resend.dev
```
> **Nota:** Ajuste el puerto (`5432` o `5433`) y la contraseña de su usuario `postgres`.

### Paso 3.5: Inicializar las Tablas y Datos Semilla
Ejecute el script de inicialización automática adaptado para el SENA:
```powershell
python setup_sena.py
```
Este script creará automáticamente las 18+ tablas del modelo relacional e insertará los roles predeterminados (Administrador, Jugador, Propietario).

### Paso 3.6: Iniciar el Servidor de API (Uvicorn)
Inicie el servidor de desarrollo en el puerto 8000:
```powershell
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
- **Endpoint Raíz:** `http://127.0.0.1:8000/`
- **Documentación Interactiva (Swagger UI):** `http://127.0.0.1:8000/docs`
- **Documentación Alternativa (Redoc):** `http://127.0.0.1:8000/redoc`

---

## 4. INSTALACIÓN Y PUESTA EN MARCHA DEL FRONTEND (REACT + VITE)

El frontend se encuentra estructurado en el directorio `MECHAPP-FRONTEND`.

### Paso 4.1: Navegar al Directorio del Frontend
Abra una nueva terminal de comandos:
```bash
cd "MECHAPP-FRONTEND"
```

### Paso 4.2: Instalar las Dependencias de Node
```powershell
npm install
```

### Paso 4.3: Configurar Variables de Entorno del Frontend (`.env`)
Asegúrese de que el archivo `.env` en la raíz de `MECHAPP-FRONTEND` apunte al backend local:
```ini
VITE_API_URL=http://localhost:8000/api
```

### Paso 4.4: Iniciar el Servidor de Desarrollo
```powershell
npm run dev
```
La aplicación web estará disponible en su navegador en:
👉 `http://localhost:5173`

### Paso 4.5: Compilación para Producción (Build)
Cuando se desee generar la versión optimizada para despliegue:
```powershell
npm run build
```
Esto creará la carpeta `dist/` con los archivos HTML, CSS y JS minimizados listos para cualquier servidor web (Nginx, Vercel, Netlify).

---

## 5. SOLUCIÓN DE PROBLEMAS FRECUENTES (TROUBLESHOOTING)

### Problema 1: Error de conexión a PostgreSQL (`connection refused` o `password authentication failed`)
- **Causa:** El puerto configurado en `.env` (ej. 5433) no coincide con el puerto donde está escuchando su PostgreSQL (frecuentemente 5432), o la contraseña es incorrecta.
- **Solución:** Revise en pgAdmin el puerto de su servidor (clic derecho en el servidor > Properties > Connection > Port) y corrija el valor en el archivo `.env`.

### Problema 2: Error de CORS (`Cross-Origin Request Blocked`)
- **Causa:** El frontend corre en un puerto no registrado en los orígenes permitidos de FastAPI.
- **Solución:** En `MECHAPP-BACKEND/main.py`, la lista `origins` ya contempla `http://localhost:5173`, `http://127.0.0.1:5173`, `http://localhost:3000` y puertos de Expo. Asegúrese de ingresar siempre por una de estas URLs.

### Problema 3: Puerto 8000 o 5173 ocupado
- **Solución en Windows:**
```powershell
# Ver qué proceso usa el puerto 8000:
netstat -ano | findstr :8000
# Terminar proceso por su PID:
taskkill /PID <PID_NUMERO> /F
```

---

## 6. HOJA DE RUTA PARA EL DESPLIEGUE EN LA NUBE (FUTURO)

Tal como se acordó, el despliegue en producción queda preparado para cuando se completen las revisiones finales. La arquitectura recomendada y probada para MechApp es:

1. **Base de Datos:** **Supabase** o **Neon.tech** (PostgreSQL Serverless gratuito con SSL).
2. **Backend API:** **Render.com** o **Railway.app** (Web Service Python con Uvicorn).
3. **Frontend SPA:** **Vercel** o **Netlify** (Despliegue continuo conectado al repositorio de GitHub).