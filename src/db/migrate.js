/**
 * Aplica src/db/schema.sql contra la base de datos configurada en .env.
 * Uso: npm run migrate
 *
 * Es idempotente (todas las sentencias usan IF NOT EXISTS), así que se puede
 * correr varias veces sin romper nada — útil al configurar un entorno nuevo
 * (local, o el servidor de hosting en Fase 5).
 */
const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

async function migrate() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  console.log('Aplicando esquema desde schema.sql...');
  try {
    await pool.query(schemaSql);
    console.log('✔ Esquema aplicado correctamente.');
  } catch (err) {
    console.error('✘ Error al aplicar el esquema:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

migrate();
