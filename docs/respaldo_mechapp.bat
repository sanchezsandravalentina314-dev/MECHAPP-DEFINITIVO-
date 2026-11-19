@echo off
title Respaldo de Base de Datos - MechApp (PostgreSQL)
color 0A
set PG_HOST=localhost
set PG_PORT=5433
set PG_USER=postgres
set PGPASSWORD=1983
set DB_NAME=MechApp
set BACKUP_DIR=C:\Users\ASUS\Documents\MECHAPP_ENTREGABLES\backups
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set TIMESTAMP=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2%_%datetime:~8,2%%datetime:~10,2%
set BACKUP_FILE=%BACKUP_DIR%\mechapp_db_%TIMESTAMP%.sql
echo ===================================================
echo   RESPALDO DE BASE DE DATOS MECHAPP
echo ===================================================
pg_dump -h %PG_HOST% -p %PG_PORT% -U %PG_USER% -d "%DB_NAME%" --clean --if-exists --inserts -f "%BACKUP_FILE%"
if %ERRORLEVEL% equ 0 (
    echo [EXITO] Respaldo generado correctamente en:
    echo %BACKUP_FILE%
) else (
    echo [ERROR] No se pudo conectar a PostgreSQL en el puerto %PG_PORT%.
)
echo ===================================================
pause