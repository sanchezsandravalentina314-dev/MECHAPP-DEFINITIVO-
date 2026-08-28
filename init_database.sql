-- ============================================================================
-- BASE DE DATOS: MECHAPP (Turmequé / Tejo)
-- Generado para PostgreSQL
-- ============================================================================

-- 1. TABLA: roles
CREATE TABLE IF NOT EXISTS roles (
    id_rol SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(150),
    estado BOOLEAN NOT NULL DEFAULT TRUE
);

-- 2. TABLA: usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario SERIAL PRIMARY KEY,
    id_rol INTEGER NOT NULL REFERENCES roles(id_rol),
    nombre VARCHAR(100) NOT NULL,
    documento VARCHAR(20) NOT NULL UNIQUE,
    correo VARCHAR(150) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    contrasena VARCHAR(255) NOT NULL,
    estado BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS ix_usuarios_id_usuario ON usuarios(id_usuario);
CREATE INDEX IF NOT EXISTS ix_usuarios_correo ON usuarios(correo);

-- 3. TABLA: ubicaciones
CREATE TABLE IF NOT EXISTS ubicaciones (
    id_ubicacion SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    direccion VARCHAR(200) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    barrio VARCHAR(100),
    estado BOOLEAN NOT NULL DEFAULT TRUE
);

-- 4. TABLA: canchas
CREATE TABLE IF NOT EXISTS canchas (
    id_cancha SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    id_ubicacion INTEGER NOT NULL REFERENCES ubicaciones(id_ubicacion),
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    capacidad INTEGER,
    estado BOOLEAN NOT NULL DEFAULT TRUE,
    precio_hora NUMERIC(10, 2)
);
CREATE INDEX IF NOT EXISTS ix_canchas_id_cancha ON canchas(id_cancha);

-- 5. TABLA: horarios_disponibles
CREATE TABLE IF NOT EXISTS horarios_disponibles (
    id_horario SERIAL PRIMARY KEY,
    id_cancha INTEGER NOT NULL REFERENCES canchas(id_cancha),
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    estado BOOLEAN NOT NULL DEFAULT TRUE
);

-- 6. TABLA: reservas
CREATE TABLE IF NOT EXISTS reservas (
    id_reserva SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    id_cancha INTEGER NOT NULL REFERENCES canchas(id_cancha),
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    valor NUMERIC(10, 2) NOT NULL,
    estado VARCHAR(30) NOT NULL,
    fecha_reserva TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. TABLA: torneos
CREATE TABLE IF NOT EXISTS torneos (
    id_torneo SERIAL PRIMARY KEY,
    id_cancha INTEGER NOT NULL REFERENCES canchas(id_cancha),
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    premio NUMERIC(12, 2),
    estado VARCHAR(30) NOT NULL,
    cupo_maximo INTEGER
);

-- 8. TABLA: inscripciones
CREATE TABLE IF NOT EXISTS inscripciones (
    id_inscripcion SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    id_torneo INTEGER NOT NULL REFERENCES torneos(id_torneo),
    fecha_inscripcion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(30) NOT NULL
);

-- 9. TABLA: equipos
CREATE TABLE IF NOT EXISTS equipos (
    id_equipo SERIAL PRIMARY KEY,
    id_capitan INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    estado BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 10. TABLA: equipo_jugador
CREATE TABLE IF NOT EXISTS equipo_jugador (
    id_equipo_jugador SERIAL PRIMARY KEY,
    id_equipo INTEGER NOT NULL REFERENCES equipos(id_equipo),
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    fecha_ingreso DATE NOT NULL,
    estado BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uq_equipo_jugador UNIQUE (id_equipo, id_usuario)
);

-- 11. TABLA: inscripcion_equipos
CREATE TABLE IF NOT EXISTS inscripcion_equipos (
    id_inscripcion_equipo SERIAL PRIMARY KEY,
    id_equipo INTEGER NOT NULL REFERENCES equipos(id_equipo),
    id_torneo INTEGER NOT NULL REFERENCES torneos(id_torneo),
    fecha_inscripcion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(30) NOT NULL,
    CONSTRAINT uq_inscripcion_equipo_torneo UNIQUE (id_equipo, id_torneo)
);

-- 12. TABLA: partidos
CREATE TABLE IF NOT EXISTS partidos (
    id_partido SERIAL PRIMARY KEY,
    id_torneo INTEGER NOT NULL REFERENCES torneos(id_torneo),
    id_equipo_local INTEGER NOT NULL REFERENCES equipos(id_equipo),
    id_equipo_visitante INTEGER NOT NULL REFERENCES equipos(id_equipo),
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    ronda VARCHAR(50),
    estado VARCHAR(30) NOT NULL
);

-- 13. TABLA: resultados
CREATE TABLE IF NOT EXISTS resultados (
    id_resultado SERIAL PRIMARY KEY,
    id_partido INTEGER NOT NULL UNIQUE REFERENCES partidos(id_partido),
    id_equipo_ganador INTEGER REFERENCES equipos(id_equipo),
    puntos_local INTEGER NOT NULL,
    puntos_visitante INTEGER NOT NULL,
    observaciones TEXT
);

-- 14. TABLA: metodos_pago
CREATE TABLE IF NOT EXISTS metodos_pago (
    id_metodo_pago SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(150),
    estado BOOLEAN NOT NULL DEFAULT TRUE
);

-- 15. TABLA: pagos
CREATE TABLE IF NOT EXISTS pagos (
    id_pago SERIAL PRIMARY KEY,
    id_metodo_pago INTEGER NOT NULL REFERENCES metodos_pago(id_metodo_pago),
    id_reserva INTEGER REFERENCES reservas(id_reserva),
    id_inscripcion INTEGER REFERENCES inscripciones(id_inscripcion),
    valor NUMERIC(10, 2) NOT NULL,
    fecha_pago TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(30) NOT NULL,
    referencia VARCHAR(100)
);

-- 16. TABLA: notificaciones
CREATE TABLE IF NOT EXISTS notificaciones (
    id_notificacion SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    titulo VARCHAR(100) NOT NULL,
    mensaje TEXT NOT NULL,
    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    leida BOOLEAN NOT NULL DEFAULT FALSE
);

-- 17. TABLA: valoraciones
CREATE TABLE IF NOT EXISTS valoraciones (
    id_valoracion SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    id_cancha INTEGER NOT NULL REFERENCES canchas(id_cancha),
    puntuacion INTEGER NOT NULL,
    comentario TEXT,
    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 18. TABLA: favoritos
CREATE TABLE IF NOT EXISTS favoritos (
    id_favorito SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    id_cancha INTEGER NOT NULL REFERENCES canchas(id_cancha),
    fecha_agregado TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_favorito_usuario_cancha UNIQUE (id_usuario, id_cancha)
);

-- 19. TABLA: propietarios
CREATE TABLE IF NOT EXISTS propietarios (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    empresa VARCHAR(150),
    nit VARCHAR(50),
    telefono_contacto VARCHAR(30)
);
CREATE INDEX IF NOT EXISTS ix_propietarios_id ON propietarios(id);

-- 20. TABLA: eventos
CREATE TABLE IF NOT EXISTS eventos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    cancha_id INTEGER REFERENCES canchas(id_cancha),
    fecha DATE,
    hora TIME,
    tipo VARCHAR(50)
);
CREATE INDEX IF NOT EXISTS ix_eventos_id ON eventos(id);

-- 21. TABLA: noticias
CREATE TABLE IF NOT EXISTS noticias (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    contenido TEXT NOT NULL,
    autor_id INTEGER REFERENCES usuarios(id_usuario),
    fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    imagen_url VARCHAR(255)
);
CREATE INDEX IF NOT EXISTS ix_noticias_id ON noticias(id);

-- 22. TABLA: reportes
CREATE TABLE IF NOT EXISTS reportes (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    tipo VARCHAR(50),
    descripcion TEXT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(30) DEFAULT 'abierto'
);
CREATE INDEX IF NOT EXISTS ix_reportes_id ON reportes(id);

-- ============================================================================
-- DATOS INICIALES (SEED DATA)
-- ============================================================================

-- Roles
INSERT INTO roles (id_rol, nombre, descripcion, estado) VALUES
(1, 'Administrador', 'Control total del sistema MechApp', TRUE),
(2, 'Jugador', 'Usuario jugador para reservas y torneos', TRUE),
(3, 'Propietario', 'Administrador de canchas y clubes', TRUE)
ON CONFLICT (id_rol) DO NOTHING;

-- Métodos de Pago
INSERT INTO metodos_pago (id_metodo_pago, nombre, descripcion, estado) VALUES
(1, 'Efectivo', 'Pago presencial en la cancha', TRUE),
(2, 'Transferencia', 'Pago digital mediante billetera movil (Nequi / Daviplata)', TRUE),
(3, 'Tarjeta', 'Pago electronico con tarjeta debito o credito', TRUE),
(4, 'PSE', 'Pago seguro en linea PSE', TRUE)
ON CONFLICT (id_metodo_pago) DO NOTHING;
