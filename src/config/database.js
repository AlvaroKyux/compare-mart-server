/**
 * Pool de conexiones a PostgreSQL. Un solo punto de configuración —
 * cualquier capa que necesite acceso a datos importa este módulo.
 *
 * Nota de diseño: node-postgres (pg) crea el Pool de forma "perezosa": no
 * abre conexiones reales hasta que se ejecuta la primera query. Esto permite
 * que el servidor arranque (npm start) aunque la base de datos todavía no
 * esté disponible; el error solo aparece al intentar consultar.
 */
require('dotenv').config();
const { Pool } = require('pg');

// Las bases de datos gestionadas (Render, Railway, y la mayoría de
// proveedores en la nube) exigen SSL en las conexiones externas — a
// diferencia de Postgres local/Docker, que no lo necesita ni lo soporta
// por defecto. Se activa automáticamente cuando `DATABASE_URL` apunta a
// un host que no es localhost, así que no requiere una variable de
// entorno nueva ni tocar nada al desplegar en una plataforma distinta.
const isRemoteConnection =
  Boolean(process.env.DATABASE_URL) &&
  !process.env.DATABASE_URL.includes('localhost') &&
  !process.env.DATABASE_URL.includes('127.0.0.1');

const connectionConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: isRemoteConnection ? { rejectUnauthorized: false } : false,
    }
  : {
      host: process.env.PGHOST || 'localhost',
      port: Number(process.env.PGPORT) || 5432,
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || 'postgres',
      database: process.env.PGDATABASE || 'compare_mart_dev',
    };

const pool = new Pool(connectionConfig);

pool.on('error', (err) => {
  // Errores en clientes inactivos del pool (ej. conexión caída) — se loguean
  // aquí para no tumbar el proceso completo del servidor.
  console.error('Error inesperado en el pool de PostgreSQL:', err.message);
});

module.exports = pool;
