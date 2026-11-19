# MANUAL DE USUARIO OFICIAL DEL SISTEMA - MECHAPP
**Plataforma Digital Integral para la Gestión, Reserva y Difusión del Tejo Colombiano**

---

### FICHA TÉCNICA DEL PROYECTO
- **Nombre del Aplicativo:** MechApp (Web SPA Responsive & Mobile)
- **Centro de Formación:** Centro de Gestión de Mercados, Logística y Tecnologías de la Información — SENA
- **Programa de Formación:** Análisis y Desarrollo de Software (ADSO)
- **Ficha de Caracterización:** 3407178
- **Autoras / Aprendices:**
  - Sandra Valentina Sánchez
  - Geraldine Juliana Rico
- **Instructor Técnico:** Daniel López
- **Versión del Documento:** 2.0 (Edición Completa y Definitiva)
- **Fecha de Publicación:** Noviembre de 2026

---

## TABLA DE CONTENIDO
1. [Introducción y Propósito](#1-introducción-y-propósito)
2. [Requisitos del Sistema para el Usuario Final](#2-requisitos-del-sistema-para-el-usuario-final)
3. [Roles y Matriz de Permisos](#3-roles-y-matriz-de-permisos)
4. [Módulo de Seguridad, Autenticación y Perfil](#4-módulo-de-seguridad-autenticación-y-perfil)
   - 4.1 Registro de Nuevos Usuarios
   - 4.2 Inicio de Sesión (Login)
   - 4.3 Recuperación de Contraseña Asistida por Correo
   - 4.4 Gestión del Perfil y Datos Personales
5. [Manual del Jugador / Cliente](#5-manual-del-jugador--cliente)
   - 5.1 Exploración, Filtros y Mapa de Canchas
   - 5.2 Proceso de Agendamiento y Reserva de Pistas
   - 5.3 Pasarela de Pago Integrada y Efecto Animado de Mecha
   - 5.4 Comprobante Digital de Transacción
   - 5.5 Gestión del Módulo "Mis Reservas"
   - 5.6 Módulo de Consumo, Tienda y Combos Tradicionales
   - 5.7 Equipos, Torneos y Marcadores Tradicionales
   - 5.8 Noticias y Eventos Deportivos
6. [Manual del Propietario de Cancha / Club](#6-manual-del-propietario-de-cancha--club)
   - 6.1 Panel de Canchas y Creación de Pistas
   - 6.2 Parametrización de Tarifas y Capacidad
   - 6.3 Bloqueo Preventivo y Mantenimiento de Pistas (Greda/Bocín)
   - 6.4 Administración del Catálogo de Consumo y Combos
7. [Manual del Administrador General](#7-manual-del-administrador-general)
   - 7.1 Dashboard Analítico con Indicadores en Tiempo Real (KPIs)
   - 7.2 Gestión de Usuarios y Cambio de Roles
   - 7.3 Organización de Torneos y Calendarización de Partidos
   - 7.4 Publicación de Noticias y Eventos Comunitarios
   - 7.5 Módulo de Reportes Operativos y Financieros
8. [Preguntas Frecuentes y Solución de Incidencias (FAQ)](#8-preguntas-frecuentes-y-solución-de-incidencias-faq)
9. [Glosario de Términos](#9-glosario-de-términos)

---

## 1. INTRODUCCIÓN Y PROPÓSITO

¡Bienvenido a **MechApp**! MechApp es la solución tecnológica diseñada para exaltar, modernizar y digitalizar el tejo o turmequé, declarado mediante la Ley 613 de 2000 como el único **deporte nacional de Colombia**.

Históricamente, la reserva de canchas de tejo, la compra de bebidas tradicionales y la organización de campeonatos barriales y regionales se han realizado de manera informal o telefónica, provocando solapamientos de horarios, pérdidas económicas y falta de visibilidad para los clubes deportivos. 

**MechApp** transforma esta experiencia unificando en una sola plataforma:
- Localización geográfica de escenarios y canchas de tejo (tradicional y minitejo).
- Agendamiento en tiempo real con validación matemática contra cruces de horarios (*anti double-booking*).
- Pasarela simulada de pagos con soporte para múltiples métodos y expedición instantánea de comprobantes digitales.
- Experiencia interactiva enriquecida con animaciones y efectos sonoros emblemáticos (*¡MECHAAAA!*).
- Tienda virtual de consumo para solicitar cerveza fría, picadas típicas y combos del parche con entrega en pista.
- Sistema de torneos, creación de equipos y seguimiento de marcadores oficiales (mecha, embocinada, moñona y figura).

---

## 2. REQUISITOS DEL SISTEMA PARA EL USUARIO FINAL

MechApp es una aplicación web responsiva (Single Page Application - SPA) accesible desde cualquier dispositivo moderno sin necesidad de instalar programas adicionales.

### 2.1 Requisitos de Hardware
- **Dispositivos Móviles:** Smartphone con sistema Android 8.0+ o iOS 13.0+, pantalla táctil y mínimo 2 GB de memoria RAM.
- **Computadores / Portátiles:** Pantalla con resolución mínima de 1280x720 píxeles, 4 GB de memoria RAM y procesador Intel/AMD o equivalente.

### 2.2 Requisitos de Software y Conectividad
- **Navegadores Compatibles:**
  - Google Chrome (versión 100 o superior) - *Recomendado*.
  - Mozilla Firefox (versión 100 o superior).
  - Microsoft Edge (versión 100 o superior).
  - Apple Safari (versión 14 o superior).
- **Conectividad:** Conexión a Internet estable (mínimo 3 Mbps de velocidad de bajada).
- **Habilitaciones en el Navegador:** Javascript activado y permisos de geolocalización (opcional, para ubicar canchas cercanas).

---

## 3. ROLES Y MATRIZ DE PERMISOS

MechApp implementa un control de acceso estricto basado en roles (RBAC) para salvaguardar la integridad de los datos:

| Módulo / Funcionalidad | Jugador / Cliente (Rol 2) | Propietario de Cancha (Rol 3) | Administrador General (Rol 1) |
|---|:---:|:---:|:---:|
| **Explorar Canchas y Sedes** | ✅ Total | ✅ Total | ✅ Total |
| **Reservar Canchas y Pagar** | ✅ Total | ✅ Propio | ✅ Total |
| **Consultar Historial "Mis Reservas"** | ✅ Sus reservas | ✅ Sus reservas | ✅ Todas las reservas |
| **Hacer Pedidos de Consumo y Combos** | ✅ Total | ✅ Total | ✅ Total |
| **Crear y Modificar Canchas** | ❌ No permitido | ✅ Sus canchas | ✅ Todas las canchas |
| **Gestionar Carta y Precios de Consumo** | ❌ No permitido | ✅ De su club | ✅ Global |
| **Inscribir Equipos a Torneos** | ✅ Permitido | ✅ Permitido | ✅ Permitido |
| **Crear Torneos y Fijar Partidos** | ❌ No permitido | ❌ No permitido | ✅ Total |
| **Panel de Estadísticas y Usuarios** | ❌ No permitido | ❌ No permitido | ✅ Total |
| **Módulo de Reportes Financieros** | ✅ Personales | ✅ Personales / Sede | ✅ Consolidados globales |

---

## 4. MÓDULO DE SEGURIDAD, AUTENTICACIÓN Y PERFIL

### 4.1 Registro de Nuevos Usuarios
1. Dirígete a la página de bienvenida y haz clic en el botón superior derecho **"Registrarse"** o accede a la ruta `/registro`.
2. Completa los campos obligatorios del formulario:
   - **Nombre Completo:** Tu nombre y apellidos (ej. *Sandra Sánchez*).
   - **Documento de Identidad:** Cédula de ciudadanía o documento legal único.
   - **Correo Electrónico:** Dirección de correo válida (ej. *usuario@dominio.com*).
   - **Teléfono Celular:** Número de 10 dígitos para contactos y notificaciones.
   - **Contraseña:** Contraseña segura (mínimo 6 caracteres alfanuméricos).
   - **Tipo de Cuenta / Rol:** 
     - *Jugador / Cliente:* Si deseas buscar canchas, reservar y jugar.
     - *Propietario de Cancha:* Si administras un club de tejo y deseas publicar tus pistas.
3. Haz clic en **"Crear Cuenta"**. La plataforma encriptará tus credenciales con algoritmos de hash seguro (Bcrypt) y te redirigirá automáticamente a la pantalla de inicio de sesión con un mensaje de éxito.

### 4.2 Inicio de Sesión (Login)
1. Haz clic en **"Iniciar Sesión"** o accede a `/login`.
2. Ingresa tu correo electrónico registrado y contraseña.
3. Haz clic en **"Entrar a MechApp"**.
4. El sistema verificará tus datos, emitirá un token criptográfico seguro (JWT) y te redirigirá a tu panel correspondiente:
   - Los **Jugadores** accederán al catálogo de canchas (`/user/canchas`).
   - Los **Propietarios** accederán a la administración de pistas (`/admin/canchas`).
   - El **Administrador General** accederá al panel principal de control (`/admin/dashboard`).

### 4.3 Recuperación de Contraseña Asistida por Correo
En caso de extravío u olvido de tu contraseña:
1. En la pantalla de login, haz clic en el enlace **"¿Olvidaste tu contraseña?"** o ingresa a `/restablecer-contrasena`.
2. Ingresa tu correo electrónico registrado y presiona **"Enviar Enlace"**.
3. El sistema generará un enlace protegido con token de un solo uso válido por 30 minutos, despachado a través del servicio transaccional de correo **Resend**.
4. Abre el enlace en tu correo, escribe tu nueva contraseña, confírmala y haz clic en **"Actualizar Contraseña"**. Podrás iniciar sesión inmediatamente con tus nuevas credenciales.

### 4.4 Gestión del Perfil y Datos Personales
1. En la esquina superior derecha del menú, haz clic en tu nombre o ve a `/user/perfil`.
2. Podrás visualizar tu información de registro, rol asignado y actualizar tu teléfono de contacto o clave de acceso cuando lo desees.

---

## 5. MANUAL DEL JUGADOR / CLIENTE

### 5.1 Exploración, Filtros y Mapa de Canchas
1. Navega a la sección **"Canchas"** (`/user/canchas`).
2. Utiliza las herramientas de búsqueda rápida:
   - **Buscador de texto:** Escribe el nombre del club, cancha o dirección.
   - **Filtro por Ciudad:** Filtra instantáneamente por Bogotá, Tunja, Medellín, Cali, etc.
   - **Botón "Usar mi ubicación":** Detecta tu posición geográfica para priorizar canchas cercanas.
3. Cada tarjeta de cancha te brinda información clave:
   - Fotografía del escenario deportivo.
   - Valor por hora de juego ($ COP).
   - Capacidad máxima permitida (ej. *Hasta 8 jugadores*).
   - Calificación promedio otorgada por otros jugadores (⭐⭐⭐⭐⭐).
   - Botón **"🗺️ Mapa"**: Abre la localización satelital exacta en Google Maps.

### 5.2 Proceso de Agendamiento y Reserva de Pistas
1. En la tarjeta de la pista deseada, presiona el botón **"Reservar Cancha"**.
2. Se abrirá la ventana modal de agendamiento inteligente:
   - **Fecha de la reserva:** Selecciona el día en el calendario interactivo.
   - **Horario:** Especifica la *Hora de Inicio* y la *Hora de Fin* (ej. *18:00 a 20:00*).
3. **Motor Anti-Solapamiento:** El sistema consulta automáticamente la disponibilidad en el servidor. Si la pista ya se encuentra comprometida en ese rango, te alertará con el mensaje *"La cancha ya tiene reservas en el horario seleccionado"* y no permitirá continuar hasta elegir una franja libre.
4. El sistema calculará el costo total multiplicando la duración en horas por la tarifa por hora de la pista.
5. Haz clic en **"Continuar al Pago"**.

### 5.3 Pasarela de Pago Integrada y Efecto Animado de Mecha
1. La **Pasarela de Pagos Digital de MechApp** se desplegará mostrando el resumen de la compra.
2. Selecciona tu método preferido:
   - **💳 Tarjeta de Crédito / Débito:** Digita los 16 dígitos, nombre del titular, fecha de vencimiento y código CVC.
   - **🏦 PSE (Transferencia Bancaria):** Selecciona tu entidad financiera y tipo de persona.
   - **📱 Nequi / Daviplata:** Ingresa el número de tu línea telefónica vinculada.
3. Haz clic en **"Pagar Ahora"**.
4. **¡EXPLOSIÓN DE MECHA TRADICIONAL! 🎯💥:**
   Al verificarse la transacción, la interfaz activará una emocionante celebración visual y auditiva:
   - Chispas animadas de pólvora y fuego simulando el impacto del tejo en el bocín.
   - Efecto de audio sincronizado de detonación de mecha.
   - Mensaje de victoria: **"¡¡MECHAAAAA!! ¡Reserva confirmada con éxito!"**.

### 5.4 Comprobante Digital de Transacción
1. Concluido el pago, se generará en pantalla tu **Comprobante Digital Oficial**.
2. El comprobante incluye:
   - Número único de referencia transaccional (`TXN-000XXX`).
   - Fecha y hora exacta de emisión.
   - Cancha y sede reservada.
   - Horario reservado y duración.
   - Nombre del cliente y valor cancelado.
3. Puedes conservarlo en pantalla, descargarlo o consultarlo permanentemente en tu módulo de reservas.

### 5.5 Gestión del Módulo "Mis Reservas"
1. Ingresa a **"Mis Reservas"** (`/user/mis-reservas`).
2. Podrás revisar tus alquileres organizados por fecha y estado (*Confirmada*, *Pendiente* o *Cancelada*).
3. Si una reserva quedó en estado *Pendiente*, encontrarás el botón **"💳 Pagar con Pasarela"** para liquidarla en cualquier momento.
4. Para reservas confirmadas, pulsa **"🧾 Ver Comprobante"** para reimprimir o validar tu factura digital.
5. También encontrarás el botón de acceso directo para ordenar bebidas o picadas para esa reserva puntual.

### 5.6 Módulo de Consumo, Tienda y Combos Tradicionales
¿Quieres tener la pola bien fría y una picada campesina servida al llegar a tu cancha?
1. Dirígete a **"Consumo / Combos"** (`/consumo` o desde tu reserva en `/reservas/:idReserva/consumo`).
2. Navega entre las categorías:
   - **🔥 Combos del Parche:** Promociones armadas con descuento (ej. *Combo Moñona: 6 Cervezas Águila + Picada Mixta*).
   - **🍺 Cervezas:** Cervezas nacionales e importadas.
   - **🥟 Comidas Típicas:** Empanadas, picadas criollas, rellena, arepas boyacenses.
   - **🥤 Bebidas y Refrescos:** Gaseosas, agua embotellada y jugos.
3. Haz clic en **"Añadir al Carrito"**. Cada producto añadido generará una chispa festiva confirmando la adición.
4. En el panel lateral derecho del **Carrito de Pedido**:
   - Modifica las unidades requeridas con los botones `+` y `-`.
   - Consulta el subtotal liquidado en tiempo real.
   - El carrito se guarda automáticamente en tu navegador (*localStorage*), por lo que no perderás tu pedido si recargas la página.
5. Presiona **"Confirmar Pedido de Consumo"** y realiza el pago para que el encargado de la sede reciba la comanda y la sirva en tu pista.

### 5.7 Equipos, Torneos y Marcadores Tradicionales
1. **Creación de Equipos (`/user/equipos`):**
   - Agrupa a tus amigos de juego.
   - Registra el nombre de tu equipo (ej. *Los Embocinados de Tunja*) y añade a los integrantes.
2. **Inscripción a Torneos (`/user/torneos`):**
   - Consulta los campeonatos abiertos, fechas de premiación, cupos y valor de la bolsa de premios.
   - Pulsa **"Inscribirme"** seleccionando a tu equipo.
3. **Seguimiento de Marcadores:**
   - Consulta las tablas de puntuación del tejo tradicional:
     - **Mano (1 punto):** Tejo más cercano al bocín.
     - **Mecha (3 puntos):** Explosión de la mecha de pólvora.
     - **Embocinada (6 puntos):** El tejo se introduce limpiamente en el centro del bocín.
     - **Moñona (9 puntos):** Mecha y embocinada simultánea en el mismo tiro.

### 5.8 Noticias y Eventos Deportivos
- En `/user/noticias` y `/user/eventos`, entérate de las actividades comunitarias, festivales del tejo, clínicas de perfeccionamiento de tiro y noticias federadas.

---

## 6. MANUAL DEL PROPIETARIO DE CANCHA / CLUB

El rol de **Propietario de Cancha** está concebido para dueños o administradores de establecimientos deportivos que desean maximizar el alquiler de sus canchas y la venta de productos.

### 6.1 Panel de Canchas y Creación de Pistas
1. Inicia sesión con tus credenciales de propietario y entra a `/admin/canchas`.
2. Para registrar una nueva pista, presiona el botón **"+ Nueva Cancha"**.
3. Diligencia los parámetros solicitados:
   - **Nombre de la Pista:** Ej. *Pista Los Libertadores #1*.
   - **Tipo de Cancha:** Tejo tradicional largo (18-19.5 metros) o Minitejo (10-12 metros).
   - **Descripción:** Detalles de la cancha (techada, iluminación LED, silletería, etc.).
   - **Capacidad Máxima:** Número límite de personas por turno (ej. *8 personas*).
   - **Precio por Hora:** Tarifa al público en $ COP (ej. *$ 35.000*).
   - **Sede / Ubicación:** Asocia la pista al establecimiento correspondiente.
4. Presiona **"Guardar Cancha"**. La pista quedará inmediatamente visible para reservas en el catálogo de los jugadores.

### 6.2 Parametrización de Tarifas y Capacidad
- Puedes ajustar las tarifas en cualquier momento desde el listado de canchas presionando el botón **"Editar"**.
- Los cambios de tarifa solo aplicarán para las reservas que se realicen a partir de ese instante, respetando los valores pactados en reservas previas.

### 6.3 Bloqueo Preventivo y Mantenimiento de Pistas (Greda/Bocín)
El deporte del tejo exige acondicionamiento constante de las cajas de greda y reposición de bocines de acero:
1. Si una pista requiere cambio de plastilina/greda o mantenimiento correctivo, puedes inactivarla temporalmente usando el interruptor de estado (*Activa / Inactiva*).
2. De esta forma, ningún jugador podrá reservarla en el portal público hasta que la habilites de nuevo, evitando inconformidades y malas reseñas.

### 6.4 Administración del Catálogo de Consumo y Combos
1. Accede a **"Gestión de Consumo"** (`/propietario/consumo`).
2. **Crear Productos:** Define el nombre (ej. *Cerveza Club Colombia Dorada*), precio unitario e inventario disponible.
3. **Crear Combos:** Agrupa productos y genera promociones llamativas para incentivar el consumo grupal de los parches de tejo.

---

## 7. MANUAL DEL ADMINISTRADOR GENERAL

El **Administrador General (Rol 1)** posee la gobernanza técnica y funcional total sobre la plataforma MechApp.

### 7.1 Dashboard Analítico con Indicadores en Tiempo Real (KPIs)
Al ingresar al sistema (`/admin/dashboard`), el administrador cuenta con un panel resumen con contadores en vivo:
- **👥 Usuarios Registrados:** Total de clientes y propietarios dados de alta.
- **📍 Canchas / Escenarios:** Número de pistas activas registradas en la base de datos.
- **🏆 Torneos Activos:** Campeonatos vigentes y en proceso de inscripción.
- **📅 Reservas Globales:** Total de alquileres procesados en la historia de la plataforma.
- **Acceso Directo:** Botones de gestión rápida a los módulos de auditoría y configuración.

### 7.2 Gestión de Usuarios y Cambio de Roles
1. Ingresa a `/admin/usuarios`.
2. Visualiza la tabla consolidada con nombres, documentos, correos, roles actuales y estados.
3. **Promover o Cambiar Rol:** Permite modificar un usuario de *Jugador* a *Propietario de Cancha* o *Administrador*.
4. **Activación / Suspensión de Cuentas:** Permite deshabilitar el acceso preventivo de cualquier usuario en caso de comportamientos inadecuados o faltas al reglamento.

### 7.3 Organización de Torneos y Calendarización de Partidos
1. **Torneos (`/admin/torneos`):** Crea los certámenes deportivos estipulando sede anfitriona, fecha de inicio, fecha de clausura, cupo máximo de equipos y premios a repartir.
2. **Equipos (`/admin/equipos`):** Revisa los equipos inscritos y valida que cumplan con la cantidad de jugadores reglamentaria.
3. **Partidos (`/admin/partidos`):** Fija las llaves de enfrentamiento, asigna la pista de juego, fecha y horario, y registra los puntos de cada lance para actualizar la tabla de clasificación.

### 7.4 Publicación de Noticias y Eventos Comunitarios
- En `/admin/noticias` y `/admin/eventos`, el administrador redacta y publica artículos, avisos oficiales de campeonatos y festividades del tejo para difusión en todo el portal.

### 7.5 Módulo de Reportes Operativos y Financieros
1. Navega a **"Reportes"** (`/admin/reportes`).
2. Consulta el tablero integral de auditoría que unifica:
   - Historial de pagos y referencias de transacción (`TXN-XXXXXX`).
   - Métodos de pago empleados (Tarjeta, PSE, Nequi).
   - Recaudos por concepto de reservas vs consumo de productos.
   - Filtros dinámicos por período (*Hoy, Esta Semana, Este Mes, Histórico*).
   - Buscador rápido por código de reserva o nombre de cliente.
3. Visualización y reimpresión de comprobantes fiscales para auditoría contable.

---

## 8. PREGUNTAS FRECUENTES Y SOLUCIÓN DE INCIDENCIAS (FAQ)

### P1: ¿Qué ocurre si dos jugadores intentan apartar la misma cancha a la misma hora?
**R:** MechApp cuenta con un motor anti-solapamiento de reservas en el backend. La primera transacción que se confirme bloqueará la franja horaria; para el segundo usuario el sistema emitirá de inmediato una alerta de conflicto (Código HTTP 409), impidiendo cualquier reserva duplicada y protegiendo el dinero del usuario.

### P2: No me llegó el correo para restablecer mi contraseña, ¿qué debo hacer?
**R:** Revisa tu carpeta de correo no deseado o *Spam*. El correo es enviado a través de la pasarela **Resend**. Si tras 2 minutos no lo recibes, verifica que el correo escrito coincida exactamente con el registrado en tu cuenta de MechApp y vuelve a solicitarlo.

### P3: ¿Cómo se garantiza que el sonido y la animación de la Mecha funcionen en mi celular?
**R:** La animación de chispas y el audio del impacto en el bocín están sintetizados nativamente en la aplicación web mediante Javascript y la API de Web Audio. Asegúrate de tener habilitado el volumen en tu dispositivo y haber interactuado con la pantalla antes de confirmar el pago.

### P4: ¿Puedo cancelar una reserva ya pagada?
**R:** Sí. Dirígete a **"Mis Reservas"** y solicita la cancelación con al menos 24 horas de antelación según la política del club. El administrador o propietario gestionará la liberación del horario en la plataforma.

### P5: ¿Puedo pedir comida y cerveza sin tener una reserva de cancha activa?
**R:** Sí. Puedes ingresar directamente al módulo de **"Consumo"** (`/consumo`) y pedir para consumo en las zonas sociales o barras del club de tejo.

---

## 9. GLOSARIO DE TÉRMINOS

### 9.1 Términos Tradicionales del Tejo
- **Tejo / Turmequé:** Disco metálico cilíndrico de peso variable (aproximadamente 1 a 3 libras) que se lanza hacia la caja de greda.
- **Bocín:** Cilindro o aro metálico de acero templado empotrado en el centro de la caja de greda.
- **Mecha:** Sobre de papel triangular con pólvora que se sitúa sobre el borde del bocín para detonar al impacto del tejo.
- **Greda:** Arcilla húmeda o plastilina sintética especial contenida en el tablero para amortiguar el tejo.
- **Mano (1 punto):** Jugada en la que el tejo queda más cerca del bocín que los tejos de los rivales, sin reventar mecha ni embocinar.
- **Mecha (3 puntos):** Tiro certero que hace detonar el sobre de pólvora.
- **Embocinada (6 puntos):** Jugada magistral donde el tejo se inserta limpiamente en el interior del cilindro del bocín con su base hacia adelante.
- **Moñona (9 puntos):** La máxima jugada del tejo: el tejo hace estallar la mecha y queda simultáneamente alojado en el interior del bocín.
- **Minitejo:** Variante moderna y compacta del deporte jugada a distancias más cortas (10 a 12 metros), ideal para espacios urbanos y clubes cerrados.

### 9.2 Términos Técnicos del Sistema
- **JWT (JSON Web Token):** Credencial de seguridad cifrada utilizada por MechApp para mantener la sesión del usuario activa de forma privada y protegida.
- **RBAC (Role-Based Access Control):** Mecanismo de seguridad que condiciona qué pantallas y acciones puede realizar un usuario según sea Administrador, Propietario o Jugador.
- **Anti Double-Booking:** Algoritmo matemático implementado en el servidor que valida la no existencia de solapamientos temporales en una misma pista antes de confirmar una reserva.
- **SPA (Single Page Application):** Aplicación web que carga una sola vez y navega de forma instantánea y fluida sin recargas lentas de página.
- **Resend API:** Servicio de mensajería electrónica utilizado para la emisión y entrega de correos transaccionales seguros de restablecimiento de contraseña.

---
*Manual de Usuario de MechApp aprobado y verificado para la sustentación del proyecto formativo ADSO - SENA.*
