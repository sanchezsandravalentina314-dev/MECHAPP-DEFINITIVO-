# PLAN MAESTRO DE PRUEBAS DE SOFTWARE (TEST PLAN) - MECHAPP
**Estándar IEEE 829-2008 / ISO/IEC/IEEE 29119**

---

### FICHA DE IDENTIFICACIÓN
- **Proyecto:** MechApp - Plataforma para la Gestión de Canchas de Tejo
- **Programa:** Análisis y Desarrollo de Software (ADSO) - SENA
- **Ficha:** 3407178
- **Equipo de Calidad y Pruebas:**
  - Sandra Valentina Sánchez (Líder de Pruebas y QA)
  - Geraldine Juliana Rico (Desarrolladora / Analista de Pruebas)
- **Instructor Responsable:** Daniel López
- **Versión:** 2.0 (Alineada al código real de FastAPI + React + PostgreSQL)
- **Fecha:** Noviembre de 2026

---

## 1. INTRODUCCIÓN Y ALCANCE

### 1.1 Propósito del Plan
Establecer el marco formal y sistemático para la planificación, diseño, ejecución y evaluación de pruebas sobre el aplicativo **MechApp**, asegurando que todos los requisitos funcionales (RF01 - RF35) y no funcionales (RNF01 - RNF10) operen de acuerdo con los estándares de calidad del SENA y las mejores prácticas de la industria del software.

### 1.2 Alcance de las Pruebas (In-Scope)
- **Pruebas de Componentes y Unitarias:** Modelos SQLAlchemy, esquemas Pydantic, funciones de seguridad y hashing de contraseñas.
- **Pruebas de Integración de API (Backend):** Validación de todos los endpoints de FastAPI (`/api/auth`, `/api/canchas`, `/api/reservas`, `/api/consumo`, `/api/pagos`, `/api/torneos`).
- **Pruebas de Concurrencia e Integridad Transaccional:** Validación del motor de reservas contra intentos simultáneos de agendamiento en la misma cancha y fecha (bloqueo de colisiones).
- **Pruebas de Frontend (UI/UX):** Navegación de rutas protegidas por roles (`RoleRoute`), validación de formularios, pasarela simulada, carrito de consumo interactivo y efecto visual de MechaExplosion.
- **Pruebas de Aceptación de Usuario (UAT):** Flujos completos de extremo a extremo para los perfiles Jugador, Propietario y Administrador.

### 1.3 Elementos Fuera del Alcance (Out-of-Scope)
- Cobros reales en pasarelas bancarias (se emplean entornos de prueba controlados y mocks de transacción).
- Pruebas en navegadores obsoletos (ej. Internet Explorer 11).

---

## 2. ESTRATEGIA Y METODOLOGÍA DE PRUEBAS

Se aplica el modelo de la **Pirámide de Pruebas**:

```
           /\
          /  \     Pruebas de Aceptación (UAT)
         /    \    Flujos completos de usuario
        /------\
       /        \   Pruebas de Sistema e Integración
      /          \  Endpoints API REST + Frontend React
     /------------\
    /              \ Pruebas Unitarias
   /________________\ Lógica de negocio, modelos y validadores
```

### 2.1 Criterios de Inicio, Suspensión y Aceptación
- **Criterio de Inicio:** Base de datos PostgreSQL inicializada con datos semilla (`setup_sena.py`), Backend ejecutándose en puerto 8000 y Frontend compilado/servido en puerto 5173.
- **Criterio de Suspensión:** Falla crítica que impida el inicio de sesión o la conexión a la base de datos.
- **Criterio de Aprobación Global:** 100% de los casos de prueba críticos (Autenticación, Reservas y Pagos) aprobados; 0 defectos de severidad Bloqueante o Alta.

---

## 3. AMBIENTE DE PRUEBAS

- **Servidor Backend:** Python 3.11+, FastAPI 0.100+, Uvicorn, PostgreSQL 14+ local.
- **Cliente Frontend:** Node.js 18+, Vite 5+, React 18+, navegadores Chrome 120+, Edge 120+, Firefox 120+.
- **Herramientas de Apoyo:** Swagger UI interactivo (`/docs`), Postman / Thunder Client, Chrome DevTools y scripts de prueba automatizados.

---

## 4. MATRIZ DETALLADA DE CASOS DE PRUEBA (CASOS REALES)

| ID | Módulo | Descripción de la Prueba | Datos de Entrada | Resultado Esperado | Resultado Obtenido | Estado |
|---|---|---|---|---|---|---|
| **CP01** | Autenticación | Registro de nuevo usuario con datos válidos | Nombre: "Carlos Tejo", Doc: "10203040", Correo: "carlos@test.com", Clave: "Tejo123!" | Código HTTP 201 Created. Token JWT emitido. Usuario guardado con clave encriptada (Bcrypt). | Usuario registrado exitosamente y token recibido. | **APROBADO** |
| **CP02** | Autenticación | Intento de registro con correo duplicado | Correo preexistente: "carlos@test.com" | Código HTTP 400 Bad Request: "Ya existe una cuenta con ese correo." | Rechazado con mensaje claro de correo duplicado. | **APROBADO** |
| **CP03** | Autenticación | Inicio de sesión con credenciales correctas | Correo: "carlos@test.com", Contraseña: "Tejo123!" | Código HTTP 200 OK. Retorno de `access_token` y objeto del usuario. | Login exitoso, token guardado en cliente. | **APROBADO** |
| **CP04** | Autenticación | Inicio de sesión con contraseña errónea | Correo: "carlos@test.com", Contraseña: "ClaveInvalida" | Código HTTP 401 Unauthorized: "Correo o contraseña incorrectos." | Acceso denegado con código 401. | **APROBADO** |
| **CP05** | Seguridad | Encriptación estricta y descarte de clave plana | Intento de validación con clave sin hash | La función `verify_password` descarta texto plano y solo admite hashes válidos. | Fallback plano bloqueado correctamente. | **APROBADO** |
| **CP06** | Roles | Acceso a panel de administración con rol Jugador | Jugador (Rol 2) intenta navegar a `/admin/dashboard` | El componente `RoleRoute` bloquea el acceso y redirige a la página principal. | Redirección inmediata sin exposición de datos. | **APROBADO** |
| **CP07** | Canchas | Búsqueda y filtrado dinámico de canchas | Texto de búsqueda: "Bogotá" o nombre de cancha | La cuadrícula de canchas se actualiza en tiempo real mostrando solo las coincidencias. | Filtro instantáneo sin recargar la página. | **APROBADO** |
| **CP08** | Reservas | Consulta de disponibilidad horaria | Cancha ID 1, Fecha: Mañana | Lista de intervalos ya ocupados o mensaje de disponibilidad completa. | Horarios ocupados visualizados correctamente. | **APROBADO** |
| **CP09** | Reservas | Creación de reserva exitosa sin solapamiento | Cancha 1, Fecha mañana, 18:00 a 20:00 | Código HTTP 201. Reserva generada con estado "Pendiente Pago". | Reserva creada y enviada a pasarela de pago. | **APROBADO** |
| **CP10** | Reservas | **Control de Concurrencia / Anti-Colisión** | Misma cancha 1, misma fecha, horario traslapado: 19:00 a 21:00 | **Código HTTP 409 Conflict:** "La cancha ya cuenta con una reserva activa en esa franja horaria." | **Colisión detectada y rechazada con HTTP 409.** | **APROBADO** |
| **CP11** | Reservas | Validación de coherencia horaria | Hora inicio: "20:00", Hora fin: "18:00" | Código HTTP 400: "La hora de finalización debe ser posterior a la de inicio." | Rechazado con mensaje de validación. | **APROBADO** |
| **CP12** | Pasarela | Simulación de pago con tarjeta/PSE | Monto: $70.000 COP, Referencia de reserva | Transacción aprobada, actualización de estado a "Confirmada" y emisión de comprobante digital. | Pago procesado y comprobante generado. | **APROBADO** |
| **CP13** | UI/UX | **Efecto de Mecha y Sonido al Confirmar Reserva** | Confirmación de pago de cancha | Se dispara el componente `MechaExplosion` con animación de chispas, bocín y audio sintetizado. | **Animación visual y sonora desplegada con éxito.** | **APROBADO** |
| **CP14** | Consumo | Visualización del catálogo de combos y bebidas | Ingreso a `/user/consumo` o tras reservar | Lista de categorías, productos individuales y combos con precios en formato colombiano (COP). | Catálogo renderizado con fotos y detalles. | **APROBADO** |
| **CP15** | Consumo | Agregar combo y producto al carrito | Clic en "Añadir Combo Parche Tejo" | El carrito incrementa contador y dispara efecto de chispa de sabor. | Item añadido y total recalculado. | **APROBADO** |
| **CP16** | Consumo | Modificación de cantidades y vaciado de carrito | Aumentar a 2 unidades o eliminar producto | Total a pagar actualizado de forma reactiva en el carrito lateral. | Totales sincronizados en tiempo real. | **APROBADO** |
| **CP17** | Consumo | Confirmación y pago de pedido de consumo | Carrito con 1 combo y 2 bebidas | Pedido guardado en backend, ítems asociados a la cancha/reserva y MechaExplosion disparada. | Pedido registrado y carrito limpiado. | **APROBADO** |
| **CP18** | Torneos | Creación y listado de torneo deportivo | Nombre: "Torneo Rey de la Mecha 2026", Cupo: 16 | Torneo visible en la cartelera pública y disponible para inscripciones. | Torneo publicado en estado "Abierto". | **APROBADO** |
| **CP19** | Comprobante | Consulta de Comprobante Digital | Clic en "Ver Comprobante" en Mis Reservas | Modal emergente con datos fiscales simulados, código de barras/referencia y botón de impresión. | Comprobante visualizado nítidamente. | **APROBADO** |
| **CP20** | Respaldo | Ejecución de script de backup de base de datos | Ejecutar `respaldo_mechapp.bat` | Archivo `.sql` generado en carpeta de respaldos con tamaño coherente y tablas completas. | Backup generado sin errores en PostgreSQL. | **APROBADO** |

---

## 5. RESUMEN DE RESULTADOS Y EVALUACIÓN FINAL

- **Total de Casos Diseñados:** 20
- **Total de Casos Ejecutados:** 20
- **Casos Aprobados:** 20 (100%)
- **Casos Fallidos:** 0 (0%)
- **Defectos Críticos Abiertos:** 0

### Conclusión Técnica de Calidad:
La versión actual de **MechApp** cumple rigurosamente con los requerimientos funcionales, de seguridad criptográfica y de concurrencia transaccional. La inclusión de la validación anti-solapamiento de horarios y la microinteracción de la mecha de tejo fortalecen la madurez técnica y la experiencia de usuario del proyecto. Se emite **concepto favorable** para su presentación formal.