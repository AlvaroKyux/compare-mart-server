const comparacionesRepository = require('../repositories/comparacionesRepository');
const favoritosRepository = require('../repositories/favoritosRepository');
const { ValidationError } = require('./favoritosService');

async function registrar({ firebaseUid, nombre, productoId, nombreProducto, supermercadoOrigen, supermercadoMejor, ahorroDetectado }) {
  if (!firebaseUid || !productoId || !nombreProducto || !supermercadoOrigen || !supermercadoMejor) {
    throw new ValidationError(
      'firebaseUid, productoId, nombreProducto, supermercadoOrigen y supermercadoMejor son requeridos.'
    );
  }
  if (typeof ahorroDetectado !== 'number' || ahorroDetectado < 0) {
    throw new ValidationError('ahorroDetectado debe ser un número mayor o igual a 0.');
  }

  const usuarioId = await favoritosRepository.crearUsuarioSiNoExiste(firebaseUid, nombre || 'Usuario');
  return comparacionesRepository.registrar(usuarioId, {
    productoId,
    nombreProducto,
    supermercadoOrigen,
    supermercadoMejor,
    ahorroDetectado,
  });
}

async function listar(firebaseUid, limite) {
  if (!firebaseUid) {
    throw new ValidationError('firebaseUid es requerido.');
  }
  const usuarioId = await favoritosRepository.obtenerUsuarioIdPorFirebaseUid(firebaseUid);
  if (!usuarioId) return [];
  return comparacionesRepository.listarPorUsuario(usuarioId, limite);
}

module.exports = { registrar, listar };
