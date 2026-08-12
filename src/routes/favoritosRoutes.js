const { Router } = require('express');
const favoritosController = require('../controllers/favoritosController');

const router = Router();

router.get('/:firebaseUid', favoritosController.listar);
router.post('/', favoritosController.agregar);
router.delete('/:favoritoId', favoritosController.eliminar);

module.exports = router;
