const { Router } = require('express');
const comparacionesController = require('../controllers/comparacionesController');

const router = Router();

router.post('/', comparacionesController.registrar);
router.get('/:firebaseUid', comparacionesController.listar);

module.exports = router;
