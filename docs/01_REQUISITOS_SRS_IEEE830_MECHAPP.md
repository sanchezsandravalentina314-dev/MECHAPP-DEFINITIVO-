# ESPECIFICACIÓN DE REQUISITOS DE SOFTWARE (SRS) - MECHAPP
**Estándar IEEE 830 / ISO/IEC/IEEE 29148**

---

### INFORMACIÓN DEL PROYECTO
- **Nombre del Sistema:** MechApp - Plataforma Digital Integral para la Gestión del Tejo Colombiano
- **Programa de Formación:** Análisis y Desarrollo de Software (ADSO)
- **Centro de Formación:** Servicio Nacional de Aprendizaje (SENA)
- **Ficha de Caracterización:** 3407178
- **Autores / Aprendices:** 
  - Sandra Valentina Sánchez
  - Geraldine Juliana Rico
- **Instructor Técnico:** Daniel López
- **Versión del Documento:** 2.0 (Corregida y ajustada a la realidad actual del sistema)
- **Fecha de Actualización:** Noviembre de 2026

---

## 1. INTRODUCCIÓN

### 1.1 Propósito
El presente documento describe la especificación formal de requisitos funcionales y no funcionales para la versión actual y operativa de la plataforma **MechApp**. Su objetivo es servir como línea base de diseño, desarrollo, pruebas, auditoría de calidad y evaluación técnica en el marco del programa de formación ADSO del SENA.

### 1.2 Alcance del Sistema
MechApp es una solución multiplataforma orientada a la modernización y digitalización del deporte nacional de Colombia (el tejo o turmequé). El sistema centraliza y automatiza los siguientes procesos de negocio:
1. **Autenticación y Perfiles:** Registro de usuarios, login seguro mediante JWT, recuperación de contraseña asistida por correo electrónico transaccional y control de acceso basado en roles (RBAC: Administrador General, Jugador/Cliente y Propietario de Cancha).
2. **Gestión de Escenarios Deportivos:** Registro y parametrización de sedes, pistas de tejo, tarifas por hora y capacidades operativas.
3. **Motor de Reservas y Disponibilidad:** Agendamiento en tiempo real con validación matemática estricta contra solapamiento de horarios (anti double-booking) y cálculo automático de tarifas.
4. **Comercio y Carta de Consumo (Tienda de Cancha):** Módulo para oferta y pedido de bebidas, comidas típicas y combos promocionales asociados o independientes a las reservas de juego.
5. **Torneos y Competencias:** Registro de torneos, control de inscripciones individuales o por equipos, fijación de partidos y publicación de resultados.
6. **Módulo de Pagos y Comprobantes:** Pasarela simulada para validación de anticipos y liquidaciones, emitiendo comprobantes digitales de pago con referencia única de transacción.
7. **Notificaciones y Reportes:** Envío de correos de confirmación y generación de reportes operativos/financieros para la toma de decisiones.

---

## 2. DESCRIPCIÓN GENERAL DEL SISTEMA

### 2.1 Perspectiva del Producto
MechApp opera bajo una arquitectura desacoplada Cliente-Servidor:
- **Backend:** Desarrollado en Python con el framework de alto rendimiento FastAPI, persistencia gestionada mediante SQLAlchemy ORM y base de datos relacional PostgreSQL.
- **Frontend Web:** Aplicación de una sola página (SPA) desarrollada en React con Vite, React Router v6 y diseño responsivo para dispositivos móviles, tablets y escritorio.

### 2.2 Perfiles y Actores del Sistema
1. **Jugador / Cliente (Rol 2):** Deportista o aficionado que consulta canchas disponibles, agenda horarios de juego, realiza pedidos de consumo (bebidas/combos), efectúa pagos y consulta comprobantes.
2. **Propietario de Cancha (Rol 3):** Administrador de una sede o club de tejo que publica sus pistas, fija precios, gestiona horarios de apertura y administra la carta de productos/combos de su establecimiento.
3. **Administrador General (Rol 1):** Encargado de la supervisión global de la plataforma, auditoría de usuarios, gestión de roles, moderación de noticias/eventos y análisis de reportes estadísticos.

---

## 3. ESPECIFICACIÓN DE REQUISITOS FUNCIONALES (RF)

### MÓDULO 1: AUTENTICACIÓN Y GESTIÓN DE USUARIOS
- **RF01 - Registro de Usuarios:** El sistema debe permitir el registro de nuevos usuarios capturando nombre completo, tipo/número de documento, correo electrónico único, teléfono, contraseña cifrada y rol deseado.
- **RF02 - Inicio de Sesión Seguro (Login):** El sistema debe autenticar a los usuarios mediante correo y contraseña, emitiendo un token criptográfico JSON Web Token (JWT) con expiración configurable.
- **RF03 - Control de Acceso Basado en Roles (RBAC):** El sistema debe restringir el acceso a vistas y endpoints de acuerdo con el rol asignado (Administrador = 1, Jugador = 2, Propietario = 3).
- **RF04 - Recuperación de Contraseña por Correo:** El sistema debe permitir solicitar el restablecimiento de clave mediante un enlace seguro con token temporal (30 min) enviado por la API de correo (Resend).
- **RF05 - Restablecimiento de Contraseña:** El sistema debe validar el token de recuperación y actualizar la contraseña del usuario previa encriptación criptográfica.
- **RF06 - Gestión de Perfil de Usuario:** El usuario autenticado debe poder visualizar y actualizar sus datos personales (nombre, teléfono y contraseña).
- **RF07 - Administración de Usuarios (Admin):** El Administrador General debe poder listar, filtrar, activar o suspender cuentas de usuario en el sistema.

### MÓDULO 2: GESTIÓN DE SEDES, UBICACIONES Y CANCHAS
- **RF08 - Registro de Sedes y Ubicaciones:** El sistema debe permitir registrar ubicaciones geográficas especificando nombre del establecimiento, dirección, ciudad y barrio.
- **RF09 - Registro de Pistas/Canchas:** Los propietarios y administradores deben poder crear canchas asignando nombre, descripción, capacidad de jugadores, precio por hora y sede asociada.
- **RF10 - Edición y Desactivación de Canchas:** El propietario debe poder modificar las tarifas y características de sus canchas o desactivarlas temporalmente (borrado lógico).
- **RF11 - Búsqueda y Filtrado de Canchas:** Los usuarios deben poder buscar canchas en tiempo real por nombre, ciudad, barrio o rango de precios.
- **RF12 - Integración con Mapas:** La plataforma debe permitir abrir la ubicación exacta de la cancha directamente en Google Maps mediante coordenadas o dirección física.

### MÓDULO 3: MOTOR DE HORARIOS Y RESERVAS
- **RF13 - Consulta de Disponibilidad en Tiempo Real:** El sistema debe mostrar para una fecha seleccionada qué franjas horarias se encuentran libres u ocupadas en cada cancha.
- **RF14 - Creación de Reserva con Validación de No Solapamiento:** El sistema debe permitir al jugador registrar una reserva indicando fecha, hora de inicio y fin. El backend debe rechazar con código HTTP 409 cualquier reserva que colisione con una reserva activa preexistente.
- **RF15 - Cálculo Automático de Tarifa de Reserva:** El sistema debe calcular el costo total multiplicando la duración en horas por la tarifa vigente de la cancha.
- **RF16 - Gestión de Estados de Reserva:** La reserva debe transitar por los estados: *Pendiente Pago*, *Confirmada*, *Completada* o *Cancelada*.
- **RF17 - Historial de Mis Reservas:** El jugador debe poder consultar el listado de todas sus reservas pasadas y futuras con el detalle de fecha, sede, valor y estado.
- **RF18 - Cancelación de Reservas:** El usuario debe poder cancelar una reserva bajo las políticas de tiempo fijadas por el establecimiento.

### MÓDULO 4: CARTA DE CONSUMO, PRODUCTOS Y COMBOS (NUEVO)
- **RF19 - Gestión de Categorías de Consumo:** El propietario o administrador debe poder registrar categorías de productos (ej. Cervezas, Gaseosas, Piquete Tradicional, Snacks).
- **RF20 - Catálogo de Productos:** El sistema debe permitir registrar productos de consumo con nombre, descripción, precio unitario, stock y foto.
- **RF21 - Configuración de Combos Promocionales:** El sistema debe permitir crear combos que agrupen productos con un precio especial (ej. *Combo Parche Tejo: 6 Polas + Picada*).
- **RF22 - Carrito de Compras de Consumo:** El cliente debe poder armar un pedido seleccionando productos y combos, ajustando cantidades en tiempo real.
- **RF23 - Vinculación de Pedido a Reserva:** El cliente debe poder asociar su pedido de bebidas/comida a una reserva activa para entrega directa en su cancha.
- **RF24 - Confirmación de Pedido de Consumo:** El sistema debe liquidar el pedido generando el detalle consolidado y descontando existencias.

### MÓDULO 5: PAGOS Y COMPROBANTES DIGITALES
- **RF25 - Pasarela de Pago Digital Simulada:** El sistema debe ofrecer una interfaz de pago integrada con soporte para tarjeta de crédito/débito, PSE y billeteras móviles (Nequi/Daviplata).
- **RF26 - Registro de Transacción Financiera:** Por cada pago exitoso, el sistema debe registrar en la base de datos el método de pago, monto, fecha, referencia única y estado.
- **RF27 - Generación de Comprobante Digital:** El sistema debe emitir un comprobante digital descargable y visualizable con código de referencia, datos del cliente y desglose de rubros.

### MÓDULO 6: TORNEOS, EQUIPOS Y PARTIDAS
- **RF28 - Creación y Parametrización de Torneos:** El administrador debe poder crear campeonatos deportivos con fecha de inicio, fin, valor de premio, cupo máximo y sede.
- **RF29 - Inscripción de Jugadores y Equipos:** Los usuarios deben poder conformar equipos deportivos e inscribirse formalmente a los torneos vigentes.
- **RF30 - Calendarización de Partidos:** El sistema debe permitir programar los enfrentamientos de cada fecha del torneo indicando cancha, fecha y hora.
- **RF31 - Registro de Marcadores y Resultados:** Los administradores deben poder ingresar los puntos (mechas, embocinadas, moñonas y figuras) para actualizar la tabla de posiciones.

### MÓDULO 7: VALORACIONES, NOTICIAS Y REPORTES
- **RF32 - Sistema de Calificación y Reseñas:** Los jugadores que hayan completado una reserva deben poder valorar la cancha de 1 a 5 estrellas y dejar un comentario.
- **RF33 - Publicación de Noticias y Eventos:** El sistema debe permitir la difusión de eventos deportivos y noticias relevantes del club o la federación.
- **RF34 - Dashboard de Métricas Administrativas:** Panel de control con indicadores clave de rendimiento (KPIs): total de reservas del mes, ingresos recaudados, canchas más populares y usuarios activos.
- **RF35 - Exportación de Reportes:** El administrador debe poder exportar reportes de ventas y reservas en formatos digitales.

---

## 4. ESPECIFICACIÓN DE REQUISITOS NO FUNCIONALES (RNF)

| Código | Categoría (ISO 25010) | Requisito No Funcional | Criterio de Aceptación |
|---|---|---|---|
| **RNF01** | **Rendimiento** | Tiempo de Respuesta de la API | El 95% de las solicitudes HTTP al backend deben responder en menos de 1.5 segundos bajo condiciones estándar. |
| **RNF02** | **Seguridad** | Cifrado de Contraseñas | Las contraseñas de los usuarios deben encriptarse mediante algoritmos robustos con salt (Bcrypt o PBKDF2-SHA256). Prohibido almacenamiento plano. |
| **RNF03** | **Seguridad** | Autenticación sin Estado | Las comunicaciones protegidas deben validarse mediante tokens JWT firmados con clave secreta mínima de 256 bits (HS256). |
| **RNF04** | **Concurrencia** | Integridad en Reservas | El sistema debe soportar accesos concurrentes impidiendo condiciones de carrera (*race conditions*) que generen reservas duplicadas. |
| **RNF05** | **Disponibilidad** | Tasa de Operatividad | La plataforma debe garantizar una disponibilidad del 99.0% durante los horarios pico de alquiler deportivo (fines de semana y tardes). |
| **RNF06** | **Usabilidad** | Diseño Responsivo | La interfaz de usuario debe adaptarse fluidamente a dispositivos móviles (ancho 360px+), tablets y monitores de escritorio (Full HD). |
| **RNF07** | **Feedback Visual** | Experiencia Interactiva | El sistema debe ofrecer microinteracciones temáticas (animación de Mecha de Tejo y alertas toast) tras confirmar reservas o compras. |
| **RNF08** | **Mantenibilidad** | Código Modular | El backend debe estructurarse bajo el patrón Controlador-Servicio-Modelo y el frontend por módulos de funcionalidad (*feature-based*). |
| **RNF09** | **Portabilidad** | Compatibilidad de Navegadores | La aplicación web debe operar correctamente en Google Chrome, Mozilla Firefox, Microsoft Edge y Safari (versiones recientes). |
| **RNF10** | **Fiabilidad** | Transacciones ACID | Las operaciones críticas de base de datos (pago + reserva + pedido) deben ejecutarse bajo transacciones atómicas seguras. |

---

## 5. MATRIZ DE TRAZABILIDAD (Módulos vs Requisitos)

| Módulo del Sistema | Requisitos Funcionales Asociados | Requisitos No Funcionales |
|---|---|---|
| **Autenticación y Usuarios** | RF01, RF02, RF03, RF04, RF05, RF06, RF07 | RNF02, RNF03, RNF08 |
| **Sedes y Canchas** | RF08, RF09, RF10, RF11, RF12 | RNF01, RNF06, RNF09 |
| **Reservas y Horarios** | RF13, RF14, RF15, RF16, RF17, RF18 | RNF01, RNF04, RNF07, RNF10 |
| **Carta de Consumo y Combos** | RF19, RF20, RF21, RF22, RF23, RF24 | RNF01, RNF07, RNF10 |
| **Pagos y Comprobantes** | RF25, RF26, RF27 | RNF02, RNF03, RNF10 |
| **Torneos y Partidas** | RF28, RF29, RF30, RF31 | RNF01, RNF06 |
| **Reportes y Dashboard** | RF32, RF33, RF34, RF35 | RNF01, RNF05, RNF08 |

---
*Documento aprobado y verificado para la sustentación del proyecto formativo MechApp.*