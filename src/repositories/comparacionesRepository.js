const pool = require('../config/database');

async function registrar(usuarioId, datos) {
  const {
    productoId,
    nombreProducto,
    supermercadoOrigen,
    supermercadoMejor,
    ahorroDetectado,
  } = datos;

  const { rows } = await pool.query(
    `INSERT INTO comparaciones_historial
       (usuario_id, producto_id, nombre_producto, supermercado_origen, supermercado_mejor, ahorro_detectado)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, producto_id, nombre_producto, supermercado_origen, supermercado_mejor, ahorro_detectado, fecha`,
    [usuarioId, productoId, nombreProducto, supermercadoOrigen, supermercadoMejor, ahorroDetectado]
  );
  return rows[0];
}

async function listarPorUsuario(usuarioId, limite = 20) {
  const { rows } = await pool.query(
    `SELECT id, producto_id, nombre_producto, supermercado_origen, supermercado_mejor, ahorro_detectado, fecha
     FROM comparaciones_historial
     WHERE usuario_id = $1
     ORDER BY fecha DESC
     LIMIT $2`,
    [usuarioId, limite]
  );
  return rows;
}

module.exports = { registrar, listarPorUsuario };
