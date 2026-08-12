const comparacionesService = require('../services/comparacionesService');

async function registrar(req, res, next) {
  try {
    const comparacion = await comparacionesService.registrar(req.body);
    res.status(201).json({ comparacion });
  } catch (err) {
    next(err);
  }
}

async function listar(req, res, next) {
  try {
    const { firebaseUid } = req.params;
    const limite = req.query.limite ? Number(req.query.limite) : undefined;
    const historial = await comparacionesService.listar(firebaseUid, limite);
    res.status(200).json({ historial });
  } catch (err) {
    next(err);
  }
}

module.exports = { registrar, listar };
