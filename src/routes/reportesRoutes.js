const { Router } = require('express');
const reportesController = require('../controllers/reportesController');

const router = Router();

router.get('/:firebaseUid', reportesController.obtener);

module.exports = router;
