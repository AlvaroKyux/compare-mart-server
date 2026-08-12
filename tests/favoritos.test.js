/**
 * Pruebas del servidor — Fase 3 del plan maestro (ítem 11 de la rúbrica).
 * Corren contra una instancia real de la app Express + PostgreSQL real
 * (no mocks) en un puerto efímero, usando el runner nativo de Node
 * (`node --test`, sin dependencias nuevas como Jest/Mocha).
 *
 * Cada test usa un `firebaseUid` único (timestamp + random) para no
 * chocar con datos de otros tests ni con datos de desarrollo/seed ya
 * existentes en la base — evita tener que truncar tablas entre tests.
 *
 * Especificación de casos de prueba (formato IEEE 829 resumido) en
 * docs/pruebas_ieee829.md — este archivo es la implementación de esos
 * casos, no la documentación formal.
 */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const app = require('../src/app');

let server;
let baseUrl;

before(async () => {
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();
  baseUrl = `http://localhost:${port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

function uidUnico(prefijo) {
  return `${prefijo}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

test('TC-SRV-01: POST /api/favoritos con datos válidos responde 201 y crea el registro', async () => {
  const firebaseUid = uidUnico('test_add');

  const response = await fetch(`${baseUrl}/api/favoritos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firebaseUid,
      nombre: 'Usuario de Prueba',
      productoId: 'prod_test_01',
      nombreProducto: 'Producto de Prueba',
    }),
  });
  const body = await response.json();

  assert.equal(response.status, 201);
  assert.ok(body.favorito, 'la respuesta debe incluir el favorito creado');
  assert.equal(body.favorito.producto_id, 'prod_test_01');
  assert.equal(body.favorito.nombre_producto, 'Producto de Prueba');
  assert.ok(body.favorito.id, 'el favorito debe tener un id asignado por la BD');
});

test('TC-SRV-02: GET /api/favoritos/:firebaseUid para un usuario sin favoritos responde 200 y arreglo vacío', async () => {
  const firebaseUid = uidUnico('test_empty');

  const response = await fetch(`${baseUrl}/api/favoritos/${firebaseUid}`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body.favoritos, []);
});

test('TC-SRV-03: POST /api/favoritos sin productoId responde 400 por validación', async () => {
  const firebaseUid = uidUnico('test_invalid');

  const response = await fetch(`${baseUrl}/api/favoritos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firebaseUid,
      nombre: 'Usuario de Prueba',
      nombreProducto: 'Producto de Prueba',
      // productoId omitido a propósito — dispara ValidationError en el service
    }),
  });
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.ok(body.error, 'la respuesta debe incluir un mensaje de error');
});
