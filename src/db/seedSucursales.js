/**
 * Inserta sucursales reales (verificadas vía Google Places) para el feature
 * de sensor de ubicación. Uso: npm run seed:sucursales
 * (requiere haber corrido "npm run migrate" antes).
 *
 * Alcance geográfico: Pachuca de Soto, Hidalgo — zona de prueba del equipo.
 * Solo 6 de las 10 cadenas del catálogo tienen presencia aquí; HEB, Costco,
 * La Comer y Fresko no tienen sucursal en la ciudad y quedan fuera de esta
 * tabla a propósito (ver nota en schema.sql).
 *
 * Este script es idempotente: si se corre más de una vez, evita duplicar
 * las mismas sucursales usando nombre_sucursal + cadena como criterio.
 */
const pool = require('../config/database');

const SUCURSALES = [
  {
    cadena: 'walmart',
    nombre_sucursal: 'Walmart Blvd. Colosio',
    direccion: 'Blvd. Luis Donaldo Colosio 2009, Los Jales, 42064 Pachuca de Soto, Hgo.',
    latitud: 20.0923711,
    longitud: -98.7598156,
  },
  {
    cadena: 'sams_club',
    nombre_sucursal: "Sam's Club Silver Zone",
    direccion: 'Blvd. Felipe Ángeles km 87.8, Venta Prieta, 42084 Pachuca de Soto, Hgo.',
    latitud: 20.0902973,
    longitud: -98.7729083,
  },
  {
    cadena: 'sams_club',
    nombre_sucursal: "Sam's Club Río de las Avenidas",
    direccion: 'Viad. Río de las Avenidas 701, Terrazas, 42098 Pachuca de Soto, Hgo.',
    latitud: 20.1134972,
    longitud: -98.7411499,
  },
  {
    cadena: 'bodega_aurrera',
    nombre_sucursal: 'Bodega Aurrera Everardo Márquez',
    direccion: 'Blvd Everardo Márquez 101, Periodistas, 42060 Pachuca de Soto, Hgo.',
    latitud: 20.1137446,
    longitud: -98.7455385,
  },
  {
    cadena: 'bodega_aurrera',
    nombre_sucursal: 'Bodega Aurrera Nuevo Hidalgo',
    direccion: 'Blvd Nuevo Hidalgo 509, Colonias, 42083 Pachuca de Soto, Hgo.',
    latitud: 20.0587058,
    longitud: -98.7757907,
  },
  {
    cadena: 'bodega_aurrera',
    nombre_sucursal: 'Bodega Aurrera Ramón G. Bonfil',
    direccion: 'Blvd. Ramón G. Bonfil 1509-I, El Palmar, 42088 Pachuca de Soto, Hgo.',
    latitud: 20.1124298,
    longitud: -98.7739284,
  },
  {
    cadena: 'soriana',
    nombre_sucursal: 'Soriana Híper Pachuca',
    direccion: 'Blvd. Luis Donaldo Colosio 1501, Venta Prieta, 42080 Pachuca de Soto, Hgo.',
    latitud: 20.0960960,
    longitud: -98.7621151,
  },
  {
    cadena: 'soriana',
    nombre_sucursal: 'Soriana Del Valle',
    direccion: 'Plaza del Valle, Blvd Nuevo Hidalgo 1501, Venta Prieta, 42083 Pachuca de Soto, Hgo.',
    latitud: 20.0966976,
    longitud: -98.7618969,
  },
  {
    cadena: 'soriana',
    nombre_sucursal: 'Mercado Soriana Km 7',
    direccion: 'Km. 7+100, Blvd Nuevo Hidalgo S/N, Rancho la Colonia, 42080 Pachuca de Soto, Hgo.',
    latitud: 20.0546542,
    longitud: -98.7825986,
  },
  {
    cadena: 'chedraui',
    nombre_sucursal: 'Chedraui Pachuca Tulipanes',
    direccion: 'Blvd Nuevo Hidalgo S/N, Colonias, 42083 Pachuca de Soto, Hgo.',
    latitud: 20.0565689,
    longitud: -98.7769962,
  },
  {
    cadena: 'chedraui',
    nombre_sucursal: 'Súper Chedraui Explanada',
    direccion: 'Carr. México - Pachuca Km 82, San Antonio el Desmonte, 42119 Pachuca de Soto, Hgo.',
    latitud: 20.0369303,
    longitud: -98.7968417,
  },
  {
    cadena: 'city_club',
    nombre_sucursal: 'City Club Pachuca',
    direccion: 'Blvd. Nuevo Hidalgo 202 esq. Blvd. Luis Donaldo Colosio, Puerta de Hierro, 42083 Pachuca de Soto, Hgo.',
    latitud: 20.0953159,
    longitud: -98.7622286,
  },
];

async function seedSucursales() {
  console.log(`Insertando ${SUCURSALES.length} sucursales reales (Pachuca de Soto)...`);
  try {
    for (const s of SUCURSALES) {
      // No hay una restricción UNIQUE natural sobre sucursales físicas (dos
      // sucursales de la misma cadena pueden tener el mismo nombre comercial
      // en ciudades distintas), así que la idempotencia se resuelve aquí en
      // aplicación: solo insertar si no existe ya la misma cadena+nombre.
      const { rows } = await pool.query(
        'SELECT id FROM sucursales WHERE cadena = $1 AND nombre_sucursal = $2',
        [s.cadena, s.nombre_sucursal]
      );
      if (rows.length > 0) {
        console.log(`  – Ya existe: [${s.cadena}] ${s.nombre_sucursal}`);
        continue;
      }
      await pool.query(
        `INSERT INTO sucursales (cadena, nombre_sucursal, direccion, latitud, longitud)
         VALUES ($1, $2, $3, $4, $5)`,
        [s.cadena, s.nombre_sucursal, s.direccion, s.latitud, s.longitud]
      );
      console.log(`  ✔ Insertada: [${s.cadena}] ${s.nombre_sucursal}`);
    }
    console.log('✔ Seed de sucursales completado.');
  } catch (err) {
    console.error('✘ Error al insertar sucursales:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

seedSucursales();
