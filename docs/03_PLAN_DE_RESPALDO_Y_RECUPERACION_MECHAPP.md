# PLAN DE RESPALDO Y RECUPERACIÓN ANTE DESASTRES (BACKUP & DISASTER RECOVERY) - MECHAPP

---

### INFORMACIÓN INSTITUCIONAL
- **Proyecto:** MechApp - Plataforma de Gestión Deportiva
- **Entidad:** Servicio Nacional de Aprendizaje (SENA) - ADSO
- **Ficha:** 3407178
- **Responsables de Infraestructura y Datos:** Sandra Valentina Sánchez, Geraldine Juliana Rico
- **Instructor de Seguimiento:** Daniel López
- **Versión:** 2.0
- **Fecha:** Noviembre de 2026

---

## 1. OBJETIVO Y POLÍTICA DE SEGURIDAD DE LA INFORMACIÓN

El propósito de este plan es garantizar la **integridad, confidencialidad y disponibilidad** continua de la base de datos de MechApp ante fallos de hardware, corrupción de datos, errores humanos, caídas de servidor o ataques cibernéticos.

### 1.1 Métricas Clave de Continuidad del Negocio
- **RPO (Recovery Point Objective - Objetivo de Punto de Recuperación):** **24 horas.** En el peor escenario de pérdida de información, los datos perdidos no superarán un día de operación (respaldos diarios automatizados a la medianoche).
- **RTO (Recovery Time Objective - Objetivo de Tiempo de Recuperación):** **2 horas.** El tiempo máximo estimado para restablecer el servicio completo y montar la base de datos no superará 120 minutos.

---

## 2. ESTRATEGIA DE RESPALDO DE POSTGRESQL

La arquitectura de persistencia de MechApp se basa en el motor relacional **PostgreSQL**. Se establece un esquema de respaldo híbrido:

| Tipo de Copia | Frecuencia | Herramienta | Destino | Retención |
|---|---|---|---|---|
| **Respaldo Lógico Completo (SQL)** | Diario (00:00 hrs) | `pg_dump` | Disco Local + Carpeta Segura | 7 días (rotación diaria) |
| **Respaldo Semanal Consolidado** | Domingos (23:30 hrs) | `pg_dump -Fc` (Formato Custom comprimido) | Almacenamiento Secundario / Nube | 4 semanas |
| **Respaldo Mensual Histórico** | Último día de cada mes | `pg_dump` con esquema y datos | Almacenamiento Frío / Offline | 12 meses |

### 2.2 Política de Rotación y Nomenclatura
Los archivos de respaldo se nombrarán de forma estandarizada y cronológica:
```
mechapp_backup_AAAA-MM-DD_HHMMSS.sql
```
Ejemplo: `mechapp_backup_2026-11-16_000000.sql`

---

## 3. SCRIPTS AUTOMATIZADOS DE RESPALDO

### 3.1 Script para Windows (`respaldo_mechapp.bat`)
Este script se incluye en el repositorio para su ejecución manual o mediante el **Programador de Tareas de Windows (Task Scheduler)**:

```bat
@echo off
title Respaldo Automatizado de Base de Datos - MechApp (PostgreSQL)
color 0A

:: Configuración de variables
set PG_HOST=localhost
set PG_PORT=5433
set PG_USER=postgres
set PGPASSWORD=1983
set DB_NAME=MechApp
set BACKUP_DIR=C:\Users\ASUS\Documents\MECHAPP_ENTREGABLES\backups

:: Crear directorio de respaldo si no existe
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

:: Obtener fecha y hora en formato YYYYMMDD_HHMM
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set TIMESTAMP=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2%_%datetime:~8,2%%datetime:~10,2%

set BACKUP_FILE=%BACKUP_DIR%\mechapp_db_%TIMESTAMP%.sql

echo ===================================================
echo   INICIANDO RESPALDO DE MECHAPP (POSTGRESQL)
echo ===================================================
echo Base de Datos : %DB_NAME%
echo Host / Puerto : %PG_HOST%:%PG_PORT%
echo Destino       : %BACKUP_FILE%
echo Fecha/Hora    : %DATE% %TIME%
echo ---------------------------------------------------

:: Ejecución de pg_dump
pg_dump -h %PG_HOST% -p %PG_PORT% -U %PG_USER% -d "%DB_NAME%" --clean --if-exists --inserts -f "%BACKUP_FILE%"

if %ERRORLEVEL% equ 0 (
    echo.
    echo [EXITO] Respaldo generado satisfactoriamente.
    echo Archivo: %BACKUP_FILE%
) else (
    echo.
    echo [ERROR] Fallo al generar el respaldo de PostgreSQL.
    echo Verifica que el servicio de PostgreSQL este activo y las credenciales sean correctas.
)

echo ===================================================
pause
```

### 3.2 Script para Servidores Linux / Cloud (`backup_mechapp.sh`)
```bash
#!/bin/bash
# Script de Respaldo Diario de MechApp para Linux
DB_NAME="MechApp"
PG_USER="postgres"
PG_HOST="localhost"
PG_PORT="5432"
BACKUP_DIR="/var/backups/mechapp"
DATE=$(date +%Y-%m-%d_%H%M%S)

mkdir -p $BACKUP_DIR
pg_dump -h $PG_HOST -p $PG_PORT -U $PG_USER -F c -b -v -f "$BACKUP_DIR/mechapp_$DATE.dump" $DB_NAME

# Eliminar respaldos mayores a 14 días para optimizar disco
find $BACKUP_DIR -type f -name "*.dump" -mtime +14 -exec rm {} \;
```

---

## 4. PROCEDIMIENTO PASO A PASO DE RESTAURACIÓN (DISASTER RECOVERY)

Ante una eventual pérdida de información, siga este procedimiento certificado:

### Paso 1: Detener las aplicaciones activas
Detener el Backend de FastAPI y el Frontend para evitar lecturas o escrituras mientras se efectúa la restauración.
```powershell
# Detener uvicorn o el proceso activo
taskkill /IM python.exe /F
```

### Paso 2: Crear o Limpiar la Base de Datos en PostgreSQL
Abrir la terminal de comandos (CMD o PowerShell) o la consola SQL de pgAdmin:
```sql
-- Si la base de datos está dañada, se puede recrear limpia:
DROP DATABASE IF EXISTS "MechApp";
CREATE DATABASE "MechApp" WITH OWNER = postgres ENCODING = 'UTF8';
```

### Paso 3: Ejecutar la Restauración del Archivo de Respaldo
Ejecutar el comando de restauración con la herramienta cliente de PostgreSQL `psql`:
```powershell
# En Windows (usando el archivo de backup más reciente):
$env:PGPASSWORD="tu_contraseña"
psql -h localhost -p 5433 -U postgres -d MechApp -f "C:\Users\ASUS\Documents\MECHAPP_ENTREGABLES\backups\mechapp_db_YYYY-MM-DD_HHMM.sql"
```

### Paso 4: Verificación y Auditoría de Datos Landed
Realizar una comprobación rápida de conteo de registros en las tablas primarias:
```sql
SELECT 'roles' as tabla, count(*) FROM roles UNION ALL
SELECT 'usuarios', count(*) FROM usuarios UNION ALL
SELECT 'canchas', count(*) FROM canchas UNION ALL
SELECT 'reservas', count(*) FROM reservas UNION ALL
SELECT 'consumo_combos', count(*) FROM consumo_combos;
```

### Paso 5: Reinicio del Servicio
Reiniciar el backend de FastAPI (`uvicorn main:app --reload`) y validar que el endpoint de salud responda:
```
GET http://127.0.0.1:8000/health  -->  {"status": "ok"}
```

---

## 5. SIMULACROS Y PRUEBAS PERIÓDICAS DE CONTINGENCIA

- **Periodicidad de Pruebas:** Se debe ejecutar un simulacro de restauración en un entorno de pruebas o máquina virtual cada **trimestre**.
- **Bitácora de Control:** Se debe registrar la fecha, responsable, tamaño del archivo restaurado y tiempo invertido en la restauración en la hoja de control de la ficha 3407178.