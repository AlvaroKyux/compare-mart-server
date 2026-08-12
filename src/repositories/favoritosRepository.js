/**
 * Capa de acceso a datos para "favoritos". Solo SQL — sin lógica de negocio
 * ni de HTTP. Mantiene el mismo espíritu del patrón Repository que ya usa
 * el cliente Flutter (interfaz estable entre la capa de negocio y el origen
 * de datos concreto).
 */
const pool = require('../config/database');

async function obtenerUsuarioIdPorFirebaseUid(firebaseUid) {
  const { rows } = await pool.query(
    'SELECT id FROM usuarios_extendido WHERE firebase_uid = $1',
    [firebaseUid]
  );
  return rows[0]?.id ?? null;
}

async function crearUsuarioSiNoExiste(firebaseUid, nombre) {
  const { rows } = await pool.query(
    `INSERT INTO usuarios_extendido (firebase_uid, nombre)
     VALUES ($1, $2)
     ON CONFLICT (firebase_uid) DO UPDATE SET nombre = EXCLUDED.nombre
     RETURNING id`,
    [firebaseUid, nombre]
  );
  return rows[0].id;
}

async function listarPorUsuario(usuarioId) {
  const { rows } = await pool.query(
    `SELECT id, producto_id, nombre_producto, fecha_agregado
     FROM favoritos
     WHERE usuario_id = $1
     ORDER BY fecha_agregado DESC`,
    [usuarioId]
  );
  return rows;
}

async function agregar(usuarioId, productoId, nombreProducto) {
  const { rows } = await pool.query(
    `INSERT INTO favoritos (usuario_id, producto_id, nombre_producto)
     VALUES ($1, $2, $3)
     ON CONFLICT (usuario_id, producto_id) DO NOTHING
     RETURNING id, producto_id, nombre_producto, fecha_agregado`,
    [usuarioId, productoId, nombreProducto]
  );
  return rows[0] ?? null;
}

async function eliminar(usuarioId, favoritoId) {
  const { rowCount } = await pool.query(
    'DELETE FROM favoritos WHERE id = $1 AND usuario_id = $2',
    [favoritoId, usuarioId]
  );
  return rowCount > 0;
}

module.exports = {
  obtenerUsuarioIdPorFirebaseUid,
  crearUsuarioSiNoExiste,
  listarPorUsuario,
  agregar,
  eliminar,
};
