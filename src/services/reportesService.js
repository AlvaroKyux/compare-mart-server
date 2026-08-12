const reportesRepository = require('../repositories/reportesRepository');
const favoritosRepository = require('../repositories/favoritosRepository');
const { ValidationError } = require('./favoritosService');

async function generarReporte(firebaseUid) {
  if (!firebaseUid) {
    throw new ValidationError('firebaseUid es requerido.');
  }
  const usuarioId = await favoritosRepository.obtenerUsuarioIdPorFirebaseUid(firebaseUid);
  if (!usuarioId) {
    return {
      resumen: { total_comparaciones: 0, ahorro_acumulado: 0, ahorro_promedio: 0 },
      productosMasComparados: [],
      ahorroPorSupermercado: [],
    };
  }

  const [resumen, productosMasComparados, ahorroPorSupermercado] = await Promise.all([
    reportesRepository.resumenAhorro(usuarioId),
    reportesRepository.productosMasComparados(usuarioId),
    reportesRepository.ahorroPorSupermercado(usuarioId),
  ]);

  return { resumen, productosMasComparados, ahorroPorSupermercado };
}

module.exports = { generarReporte };
