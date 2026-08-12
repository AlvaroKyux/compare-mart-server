/**
 * Inserta datos de prueba mínimos para desarrollo local.
 * Uso: npm run seed  (requiere haber corrido "npm run migrate" antes)
 */
const pool = require('../config/database');

async function seed() {
  console.log('Insertando datos de prueba...');
  try {
    const { rows } = await pool.query(
      `INSERT INTO usuarios_extendido (firebase_uid, nombre)
       VALUES ('uid_demo_001', 'Usuario de Prueba')
       ON CONFLICT (firebase_uid) DO UPDATE SET nombre = EXCLUDED.nombre
       RETURNING id`
    );
    const usuarioId = rows[0].id;

    await pool.query(
      `INSERT INTO favoritos (usuario_id, producto_id, nombre_producto)
       VALUES ($1, 'prod_001', 'Aceite de Oliva 1L')
       ON CONFLICT (usuario_id, producto_id) DO NOTHING`,
      [usuarioId]
    );

    await pool.query(
      `INSERT INTO comparaciones_historial
         (usuario_id, producto_id, nombre_producto, supermercado_origen, supermercado_mejor, ahorro_detectado)
       VALUES ($1, 'prod_001', 'Aceite de Oliva 1L', 'walmart', 'chedraui', 12.50)`,
      [usuarioId]
    );

    console.log(`✔ Datos de prueba insertados para usuario_id=${usuarioId} (firebase_uid=uid_demo_001).`);
  } catch (err) {
    console.error('✘ Error al insertar datos de prueba:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

seed();
