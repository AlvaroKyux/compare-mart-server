/**
 * Traduce HTTP <-> Service. No contiene reglas de negocio ni SQL — mismo
 * patrón que favoritosController.js.
 */
const sucursalesService = require('../services/sucursalesService');

async function listar(req, res, next) {
  try {
    const sucursales = await sucursalesService.listar();
    res.status(200).json({ sucursales });
  } catch (err) {
    next(err);
  }
}

async function cercanas(req, res, next) {
  try {
    const { lat, lng, radio, cadenas } = req.query;
    const sucursales = await sucursalesService.buscarCercanas({ lat, lng, radio, cadenas });
    res.status(200).json({ sucursales });
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, cercanas };
