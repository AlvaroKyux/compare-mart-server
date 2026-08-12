/**
 * Consultas agregadas sobre el historial — es lo que alimenta la pantalla
 * de Reportes del cliente (ítem 15 de la rúbrica).
 */
const pool = require('../config/database');

async function resumenAhorro(usuarioId) {
  const { rows } = await pool.query(
    `SELECT
       COUNT(*)::int                    AS total_comparaciones,
       COALESCE(SUM(ahorro_detectado), 0)::float AS ahorro_acumulado,
       COALESCE(AVG(ahorro_detectado), 0)::float AS ahorro_promedio
     FROM comparaciones_historial
     WHERE usuario_id = $1`,
    [usuarioId]
  );
  return rows[0];
}

async function productosMasComparados(usuarioId, limite = 5) {
  const { rows } = await pool.query(
    `SELECT producto_id, nombre_producto, COUNT(*)::int AS veces_comparado
     FROM comparaciones_historial
     WHERE usuario_id = $1
     GROUP BY producto_id, nombre_producto
     ORDER BY veces_comparado DESC
     LIMIT $2`,
    [usuarioId, limite]
  );
  return rows;
}

async function ahorroPorSupermercado(usuarioId) {
  const { rows } = await pool.query(
    `SELECT supermercado_mejor AS supermercado, COUNT(*)::int AS veces_mas_barato,
            COALESCE(SUM(ahorro_detectado), 0)::float AS ahorro_total
     FROM comparaciones_historial
     WHERE usuario_id = $1
     GROUP BY supermercado_mejor
     ORDER BY ahorro_total DESC`,
    [usuarioId]
  );
  return rows;
}

module.exports = { resumenAhorro, productosMasComparados, ahorroPorSupermercado };
