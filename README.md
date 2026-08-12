# Compare-Mart — Servidor (API REST)

Backend propio del proyecto Compare-Mart. Resuelve todo lo que **no** es el catálogo
de productos (eso vive en Firestore, la BD NoSQL del cliente Flutter): favoritos,
historial de comparaciones, y reportes de ahorro — respaldado por **PostgreSQL**
(base de datos relacional).

Este servidor es la pieza que cumple los ítems **4** (BD relacional) y **10**
(servidor funcional) de la rúbrica del proyecto final.

## Arquitectura

```
src/
  config/        → configuración (pool de conexión a PostgreSQL)
  db/            → schema.sql (DDL), migrate.js, seed.js
  repositories/  → acceso a datos puro (SQL). Sin lógica de negocio ni HTTP.
  services/      → lógica de negocio y validación. Sin SQL ni HTTP.
  controllers/   → capa HTTP. Traduce request/response <-> services.
  routes/        → definición de endpoints Express.
  middleware/    → manejo de errores centralizado.
  app.js         → ensamblado de la app Express (middlewares + rutas).
  index.js       → punto de entrada (arranca el servidor).
```

**Patrón aplicado:** Layered Architecture (por capas), con una capa
`repositories/` que separa el acceso a datos del resto — el mismo espíritu
del patrón Repository que ya usa el cliente Flutter, para mantener
consistencia conceptual entre ambos lados del proyecto (relevante para el
ítem 6 de la rúbrica: documentar el patrón de diseño).

**Principio SOLID aplicado (ítem 7):** Single Responsibility — cada capa
tiene una sola razón para cambiar: `repositories/` cambia si cambia el
esquema SQL, `services/` cambia si cambian las reglas de negocio,
`controllers/` cambia si cambia el contrato HTTP.

## Requisitos previos

- Node.js `>=18`
- PostgreSQL 16 (local, o vía Docker — ver abajo)

## Instalación y arranque local

### 1. Instalar dependencias
```bash
npm install
```

### 2. Levantar PostgreSQL
**Opción A — Docker (recomendado, no requiere instalar Postgres):**
```bash
docker compose up -d
```

**Opción B — PostgreSQL instalado nativamente:**
Asegúrate de tener un usuario `postgres` con password `postgres` y crea la base:
```bash
createdb compare_mart_dev
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env
```
Los valores por defecto en `.env.example` ya coinciden con el `docker-compose.yml` —
no necesitas cambiar nada si usas la Opción A.

### 4. Aplicar el esquema (migración)
```bash
npm run migrate
```
Es idempotente — se puede correr varias veces sin problema.

### 5. (Opcional) Insertar datos de prueba
```bash
npm run seed
```

### 6. Arrancar el servidor
```bash
npm run dev     # con hot-reload (nodemon)
# o
npm start       # sin hot-reload
```

El servidor queda escuchando en `http://localhost:3000`.

## Verificar que funciona
```bash
curl http://localhost:3000/api/health
# {"status":"ok","servicio":"compare-mart-server"}
```

## Endpoints

### Favoritos
| Método | Ruta | Body | Descripción |
|---|---|---|---|
| GET | `/api/favoritos/:firebaseUid` | — | Lista los favoritos del usuario |
| POST | `/api/favoritos` | `{firebaseUid, nombre, productoId, nombreProducto}` | Agrega un favorito |
| DELETE | `/api/favoritos/:favoritoId` | `{firebaseUid}` | Elimina un favorito |

### Comparaciones (historial)
| Método | Ruta | Body | Descripción |
|---|---|---|---|
| POST | `/api/comparaciones` | `{firebaseUid, nombre, productoId, nombreProducto, supermercadoOrigen, supermercadoMejor, ahorroDetectado}` | Registra una comparación |
| GET | `/api/comparaciones/:firebaseUid?limite=20` | — | Lista el historial del usuario |

### Reportes
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/reportes/:firebaseUid` | Resumen de ahorro acumulado, productos más comparados, y ahorro por supermercado |

**Nota:** `firebaseUid` es el UID que ya devuelve Firebase Auth en el cliente
Flutter (`FirebaseAuth.instance.currentUser?.uid`) — es el puente entre la
identidad de Firebase y las tablas relacionales de este servidor. El servidor
crea automáticamente el registro en `usuarios_extendido` la primera vez que
un `firebaseUid` nuevo hace una petición (ver `crearUsuarioSiNoExiste` en
`favoritosRepository.js`), así que no hace falta un endpoint de "registro"
aparte — Firebase ya es la fuente de verdad de autenticación.

## Modelo de datos (resumen — ver `src/db/schema.sql` para el DDL completo)

```
usuarios_extendido (1) ──< (N) favoritos
usuarios_extendido (1) ──< (N) comparaciones_historial
```

Ambas relaciones son `1:N` con `ON DELETE CASCADE` — si se borra un usuario,
se borran automáticamente sus favoritos e historial.

## Pruebas end-to-end ya verificadas

Antes de entregar este backend se probó manualmente, con PostgreSQL real
corriendo, el flujo completo: crear usuario implícito → agregar favorito →
listar → rechazar duplicado (400) → registrar comparaciones → generar
reporte con agregación SQL (`SUM`, `AVG`, `GROUP BY`) → eliminar favorito →
confirmar ruta 404. Todos los casos respondieron con el status code y el
payload esperado.

Los tests automatizados en formato IEEE 829 (ítem 11 de la rúbrica) se
agregan en la Fase 3 del plan maestro, sobre esta misma base de endpoints.

## Despliegue (Fase 5 del plan maestro)

Este servidor está listo para desplegarse en **Render** o **Railway** (ambos
con tier gratuito y soporte nativo para Node + PostgreSQL). Solo hace falta:
1. Crear una base de datos PostgreSQL gestionada en el proveedor.
2. Configurar `DATABASE_URL` en las variables de entorno del servicio (en vez
   de las 5 variables `PG*` sueltas — el código ya soporta ambos formatos,
   ver `src/config/database.js`).
3. Configurar el comando de arranque como `npm run migrate && npm start`.
