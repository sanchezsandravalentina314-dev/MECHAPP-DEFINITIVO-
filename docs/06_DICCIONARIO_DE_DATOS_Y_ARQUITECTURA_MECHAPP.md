# DICCIONARIO DE DATOS Y ARQUITECTURA DEL SISTEMA - MECHAPP
**Documento Técnico Complementario para Evaluación SENA (ADSO)**

---

### INFORMACIÓN TÉCNICA
- **Proyecto:** MechApp
- **Ficha SENA:** 3407178 | Programa: Análisis y Desarrollo de Software
- **Autoras:** Sandra Valentina Sánchez, Geraldine Juliana Rico
- **Instructor:** Daniel López
- **Versión:** 2.0
- **Fecha:** Noviembre de 2026

---

## 1. ARQUITECTURA GENERAL DEL SISTEMA

MechApp adopta un patrón arquitectónico **Cliente-Servidor Desacoplado** basado en APIs RESTful y separación de responsabilidades:

```
[ CLIENTES / USUARIOS ]
  │
  ├──► Dispositivos Móviles (Navegador Móvil / PWA)
  └──► Navegadores de Escritorio (Chrome, Firefox, Edge)
          │
          ▼  [HTTPS / JSON REST API]
[ CAPA DE PRESENTACIÓN (FRONTEND) ]
  ├── React 18 + Vite (SPA)
  ├── React Router v6 (Enrutamiento y Guardias de Rol)
  ├── Componentes Modulares (Features: canchas, reservas, consumo, torneos)
  └── Microinteracción de Celebración (MechaExplosion con Web Audio)
          │
          ▼  [Llamadas HTTP asíncronas / JWT Bearer Tokens]
[ CAPA DE SERVICIOS Y LÓGICA DE NEGOCIO (BACKEND) ]
  ├── FastAPI (Python 3.11+)
  ├── Controladores (Control de flujo y validaciones)
  ├── Servicios CRUD y Lógica Transaccional (Validación anti-colisión)
  ├── Middleware de Errores y Seguridad (Bcrypt / PBKDF2 / JWT HS256)
  └── Integración de Correo Asíncrono (Resend API en hilos daemon)
          │
          ▼  [SQLAlchemy ORM + Driver Psycopg2]
[ CAPA DE PERSISTENCIA (BASE DE DATOS RELACIONAL) ]
  └── PostgreSQL 14+ (Motor ACID con Integridad Referencial)
```

---

## 2. DICCIONARIO DE DATOS EXHAUSTIVO

A continuación se detallan las tablas y atributos que conforman el modelo de base de datos relacional de MechApp:

### 2.1 Tabla: `roles`
Almacena los perfiles de usuario que definen los permisos en la plataforma.
| Campo | Tipo de Dato | Nulo | PK / FK | Descripción |
|---|---|---|---|---|
| `id_rol` | INTEGER | NO | PK | Identificador numérico único del rol (1: Admin, 2: Jugador, 3: Propietario). |
| `nombre` | VARCHAR(50) | NO | UNIQUE | Nombre identificador del rol. |
| `descripcion` | VARCHAR(150) | SÍ | - | Descripción funcional de los alcances del rol. |
| `estado` | BOOLEAN | NO | - | Estado activo (true) o inactivo (false) del rol. |

### 2.2 Tabla: `usuarios`
Registra la información de todos los actores del sistema.
| Campo | Tipo de Dato | Nulo | PK / FK | Descripción |
|---|---|---|---|---|
| `id_usuario` | INTEGER | NO | PK | Clave primaria autoincremental del usuario. |
| `id_rol` | INTEGER | NO | FK | Clave foránea que referencia a `roles(id_rol)`. |
| `nombre` | VARCHAR(100) | NO | - | Nombre completo del usuario. |
| `documento` | VARCHAR(20) | NO | UNIQUE | Cédula o número de documento de identificación único. |
| `correo` | VARCHAR(150) | NO | UNIQUE | Correo electrónico utilizado para login y notificaciones. |
| `telefono` | VARCHAR(20) | SÍ | - | Número de celular de contacto. |
| `contrasena` | VARCHAR(255) | NO | - | Hash criptográfico seguro de la contraseña (Bcrypt / PBKDF2). |
| `estado` | BOOLEAN | NO | - | Estado de la cuenta (activo/inactivo). |
| `fecha_registro` | TIMESTAMP | NO | - | Fecha y hora UTC en la que se creó el usuario. |

### 2.3 Tabla: `ubicaciones`
Registra las sedes físicas o complejos deportivos donde funcionan las canchas de tejo.
| Campo | Tipo de Dato | Nulo | PK / FK | Descripción |
|---|---|---|---|---|
| `id_ubicacion` | INTEGER | NO | PK | Identificador de la sede. |
| `nombre` | VARCHAR(100) | NO | - | Nombre comercial o de la sede deportiva. |
| `direccion` | VARCHAR(200) | NO | - | Dirección física del predio. |
| `ciudad` | VARCHAR(100) | NO | - | Ciudad de ubicación (ej. Bogotá, Tunja). |
| `barrio` | VARCHAR(100) | SÍ | - | Barrio o sector de referencia. |
| `estado` | BOOLEAN | NO | - | Estado operativo de la sede. |

### 2.4 Tabla: `canchas`
Representa cada pista física individual de tejo o minitejo.
| Campo | Tipo de Dato | Nulo | PK / FK | Descripción |
|---|---|---|---|---|
| `id_cancha` | INTEGER | NO | PK | Identificador de la pista. |
| `id_usuario` | INTEGER | NO | FK | Referencia a `usuarios(id_usuario)` (propietario responsable). |
| `id_ubicacion` | INTEGER | NO | FK | Referencia a `ubicaciones(id_ubicacion)`. |
| `nombre` | VARCHAR(100) | NO | - | Nombre de la pista (ej. "Pista Central Los Arrayanes"). |
| `descripcion` | TEXT | SÍ | - | Detalles técnicos (tejo largo, greda profesional, etc.). |
| `capacidad` | INTEGER | SÍ | - | Número máximo de jugadores admitidos por franja. |
| `precio_hora` | NUMERIC(10,2)| SÍ | - | Tarifa de alquiler por hora en pesos colombianos. |
| `estado` | BOOLEAN | NO | - | Disponibilidad activa de la cancha. |

### 2.5 Tabla: `reservas`
Entidad transaccional clave que formaliza los turnos de juego.
| Campo | Tipo de Dato | Nulo | PK / FK | Descripción |
|---|---|---|---|---|
| `id_reserva` | INTEGER | NO | PK | Identificador único de la reserva. |
| `id_usuario` | INTEGER | NO | FK | Jugador que agendó la reserva (`usuarios.id_usuario`). |
| `id_cancha` | INTEGER | NO | FK | Pista reservada (`canchas.id_cancha`). |
| `fecha` | DATE | NO | - | Fecha de realización del juego. |
| `hora_inicio` | TIME | NO | - | Hora de inicio programada. |
| `hora_fin` | TIME | NO | - | Hora de culminación del turno. |
| `valor` | NUMERIC(10,2)| NO | - | Monto liquidado por las horas de uso. |
| `estado` | VARCHAR(30) | NO | - | Estado (Pendiente Pago, Confirmada, Completada, Cancelada). |
| `fecha_reserva`| TIMESTAMP | NO | - | Marca de tiempo en que se generó la transacción. |

### 2.6 Tablas del Módulo de Consumo y Combos
- **`consumo_categorias`:** Categorías de la carta (`id_categoria`, `nombre`, `descripcion`, `activo`).
- **`consumo_productos`:** Artículos individuales (`id_producto`, `id_categoria`, `nombre`, `precio`, `stock`, `foto`).
- **`consumo_combos`:** Promociones empaquetadas (`id_combo`, `nombre`, `descripcion`, `precio`, `activo`).
- **`consumo_pedidos`:** Pedido comercial (`id_pedido`, `id_reserva`, `id_usuario`, `total`, `estado`, `fecha`).
- **`consumo_detalle_pedido`:** Desglose de productos o combos pedidos con cantidades y subtotales.

### 2.7 Tablas del Módulo Deportivo (Torneos y Partidas)
- **`torneos`:** Campeonatos organizados (`id_torneo`, `id_cancha`, `nombre`, `fecha_inicio`, `premio`, `cupo_maximo`, `estado`).
- **`equipos`:** Clubes o conjuntos de jugadores (`id_equipo`, `nombre`, `capitan_id`, `estado`).
- **`inscripciones`:** Relación entre equipos/jugadores y torneos.
- **`partidos`:** Enfrentamientos deportivos programados entre equipos con fecha y horario.
- **`resultados`:** Puntos oficiales acumulados (mechas, embocinadas, moñonas, total).

### 2.8 Tablas Financieras y de Interacción
- **`metodos_pago`:** Catálogo de formas de pago (Tarjeta, PSE, Nequi, Efectivo).
- **`pagos`:** Registro del abono o pago total (`id_pago`, `id_reserva`, `monto`, `referencia`, `fecha`).
- **`valoraciones`:** Calificaciones en estrellas (1 a 5) y reseñas dejadas por los jugadores.
- **`notificaciones`:** Alertas operativas del sistema hacia los usuarios.

---

## 3. MAPA DE ENDPOINTS DE LA API (REST)

| Método | Endpoint | Descripción | Acceso |
|---|---|---|---|
| `POST` | `/api/auth/registro` | Registra un nuevo usuario en la plataforma. | Público |
| `POST` | `/api/auth/login` | Autentica y emite token JWT de sesión. | Público |
| `POST` | `/api/auth/recuperar-contrasena` | Envía enlace temporal con token al correo. | Público |
| `POST` | `/api/auth/restablecer-contrasena`| Actualiza contraseña con token válido. | Público |
| `GET` | `/api/canchas/` | Lista todas las canchas activas con sedes. | Público |
| `GET` | `/api/canchas/{id}/disponibilidad`| Consulta horarios libres y ocupados por fecha. | Público |
| `POST` | `/api/canchas/` | Crea una nueva cancha (propietario/admin). | Protegido (Rol 1, 3) |
| `GET` | `/api/reservas/` | Lista reservas registradas en el sistema. | Protegido |
| `POST` | `/api/reservas/` | **Crea reserva con validación anti-colisión.** | Protegido (Jugador) |
| `GET` | `/api/consumo/combos` | Lista la oferta de combos de tejo. | Público |
| `GET` | `/api/consumo/productos` | Lista la carta de bebidas y comida. | Público |
| `POST` | `/api/consumo/pedidos` | Registra y liquida un pedido de consumo. | Protegido |
| `GET` | `/api/torneos/` | Cartelera de torneos y campeonatos. | Público |
| `POST` | `/api/pagos/` | Registra una transacción y emite comprobante. | Protegido |