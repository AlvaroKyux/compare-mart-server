/**
 * Capa de acceso a datos para "sucursales". Solo SQL — sin lógica de negocio
 * ni de HTTP, mismo patrón que favoritosRepository.js.
 *
 * El cálculo de distancia usa la fórmula de Haversine directamente en SQL
 * (sin PostGIS ni extensiones): dado que Render/Railway no garantizan tener
 * PostGIS habilitado por defecto, esta alternativa corre en cualquier
 * PostgreSQL estándar sin configuración adicional.
 */
const pool = require('../config/database');

const RADIO_TIERRA_METROS = 6371000;

async function listarTodas() {
  const { rows } = await pool.query(
    `SELECT id, cadena, nombre_sucursal, direccion, latitud, longitud
     FROM sucursales
     ORDER BY cadena, nombre_sucursal`
  );
  return rows;
}

/**
 * Busca sucursales dentro de un radio (en metros) a partir de un punto,
 * ordenadas de la más cercana a la más lejana.
 *
 * @param {number} lat - Latitud del usuario.
 * @param {number} lng - Longitud del usuario.
 * @param {number} radioMetros - Radio de búsqueda en metros.
 * @param {string[]|null} cadenas - Si se provee, filtra solo esas cadenas
 *   (ej. las cadenas donde el producto escaneado está disponible). Si es
 *   null, busca en todas las cadenas geolocalizadas.
 */
async function buscarCercanas(lat, lng, radioMetros, cadenas) {
  const { rows } = await pool.query(
    `SELECT * FROM (
       SELECT
         id,
         cadena,
         nombre_sucursal,
         direccion,
         latitud,
         longitud,
         $3 * acos(
           LEAST(1, GREATEST(-1,
             cos(radians($1)) * cos(radians(latitud)) * cos(radians(longitud) - radians($2))
             + sin(radians($1)) * sin(radians(latitud))
           ))
         ) AS distancia_metros
       FROM sucursales
       WHERE ($4::text[] IS NULL OR cadena = ANY($4::text[]))
     ) AS sucursales_con_distancia
     WHERE distancia_metros <= $5
     ORDER BY distancia_metros ASC`,
    [lat, lng, RADIO_TIERRA_METROS, cadenas, radioMetros]
  );
  return rows;
}

module.exports = { listarTodas, buscarCercanas };
