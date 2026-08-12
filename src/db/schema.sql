-- ============================================================================
-- Compare-Mart — Esquema de Base de Datos Relacional (PostgreSQL)
-- ============================================================================
-- Alcance: todo lo que NO es el catálogo de productos (ese vive en Firestore,
-- la BD NoSQL, por su naturaleza semi-estructurada y de alto volumen).
-- Aquí viven las entidades con relaciones fuertes entre sí: un usuario tiene
-- muchos favoritos, un usuario tiene muchas entradas de historial, etc.
-- ============================================================================

-- Extiende la identidad de Firebase Auth con datos propios de la app.
-- No duplicamos correo/contraseña — Firebase ya es la fuente de verdad para
-- autenticación; aquí solo referenciamos su UID.
CREATE TABLE IF NOT EXISTS usuarios_extendido (
    id              SERIAL PRIMARY KEY,
    firebase_uid    VARCHAR(128) NOT NULL UNIQUE,
    nombre          VARCHAR(150) NOT NULL,
    fecha_registro  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Productos marcados como favoritos por un usuario.
-- producto_id referencia el ID del documento en Firestore (no hay FK real
-- entre Postgres y Firestore — es una referencia lógica cross-database).
CREATE TABLE IF NOT EXISTS favoritos (
    id              SERIAL PRIMARY KEY,
    usuario_id      INTEGER NOT NULL REFERENCES usuarios_extendido(id) ON DELETE CASCADE,
    producto_id     VARCHAR(128) NOT NULL,
    nombre_producto VARCHAR(200) NOT NULL,
    fecha_agregado  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_favorito_unico UNIQUE (usuario_id, producto_id)
);

-- Historial de comparaciones realizadas: cada vez que un usuario compara un
-- producto entre supermercados y el sistema detecta un ahorro, se guarda aquí.
-- Esta tabla es la base de los Reportes (ítem 15 de la rúbrica).
CREATE TABLE IF NOT EXISTS comparaciones_historial (
    id                  SERIAL PRIMARY KEY,
    usuario_id          INTEGER NOT NULL REFERENCES usuarios_extendido(id) ON DELETE CASCADE,
    producto_id         VARCHAR(128) NOT NULL,
    nombre_producto     VARCHAR(200) NOT NULL,
    supermercado_origen VARCHAR(50) NOT NULL,
    supermercado_mejor  VARCHAR(50) NOT NULL,
    ahorro_detectado    NUMERIC(10, 2) NOT NULL CHECK (ahorro_detectado >= 0),
    fecha               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para las consultas más frecuentes (listar por usuario, ordenar por fecha).
CREATE INDEX IF NOT EXISTS idx_favoritos_usuario       ON favoritos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_historial_usuario        ON comparaciones_historial(usuario_id);
CREATE INDEX IF NOT EXISTS idx_historial_fecha          ON comparaciones_historial(fecha DESC);
