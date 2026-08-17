/**
 * Lógica de negocio de "sucursales": valida entradas y decide qué hacer.
 * No sabe nada de HTTP (eso es del controller) ni de SQL (eso es del
 * repository) — mismo patrón que favoritosService.js (SRP).
 */
const sucursalesRepository = require('../repositories/sucursalesRepository');
const { ValidationError } = require('./favoritosService');

const RADIO_METROS_DEFECTO = 5000; // 5 km
const RADIO_METROS_MAXIMO = 50000; // 50 km — evita queries sin sentido práctico

function listar() {
  return sucursalesRepository.listarTodas();
}

function parsearCadenas(cadenasParam) {
  if (!cadenasParam) return null;
  const cadenas = String(cadenasParam)
    .split(',')
    .map((c) => c.trim().toLowerCase())
    .filter(Boolean);
  return cadenas.length > 0 ? cadenas : null;
}

async function buscarCercanas({ lat, lng, radio, cadenas }) {
  const latitud = Number(lat);
  const longitud = Number(lng);

  if (lat === undefined || lng === undefined || Number.isNaN(latitud) || Number.isNaN(longitud)) {
    throw new ValidationError('lat y lng son requeridos y deben ser números válidos.');
  }
  if (latitud < -90 || latitud > 90) {
    throw new ValidationError('lat debe estar entre -90 y 90.');
  }
  if (longitud < -180 || longitud > 180) {
    throw new ValidationError('lng debe estar entre -180 y 180.');
  }

  let radioMetros = radio !== undefined ? Number(radio) : RADIO_METROS_DEFECTO;
  if (Number.isNaN(radioMetros) || radioMetros <= 0) {
    throw new ValidationError('radio debe ser un número positivo (en metros).');
  }
  radioMetros = Math.min(radioMetros, RADIO_METROS_MAXIMO);

  const cadenasFiltro = parsearCadenas(cadenas);

  return sucursalesRepository.buscarCercanas(latitud, longitud, radioMetros, cadenasFiltro);
}

module.exports = { listar, buscarCercanas };
