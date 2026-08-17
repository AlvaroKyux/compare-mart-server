const { Router } = require('express');
const sucursalesController = require('../controllers/sucursalesController');

const router = Router();

// IMPORTANTE: '/cercanas' debe declararse ANTES que cualquier ruta con
// parámetro dinámico (ej. '/:id'), o Express interpretaría "cercanas" como
// un valor de :id. Esta ruta no tiene :id todavía, pero se deja documentado
// por si se agrega GET /:id más adelante (ej. detalle de una sucursal).
router.get('/cercanas', sucursalesController.cercanas);
router.get('/', sucursalesController.listar);

module.exports = router;
