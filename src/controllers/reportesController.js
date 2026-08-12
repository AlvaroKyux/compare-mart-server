const reportesService = require('../services/reportesService');

async function obtener(req, res, next) {
  try {
    const { firebaseUid } = req.params;
    const reporte = await reportesService.generarReporte(firebaseUid);
    res.status(200).json(reporte);
  } catch (err) {
    next(err);
  }
}

module.exports = { obtener };
