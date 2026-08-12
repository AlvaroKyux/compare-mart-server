/**
 * Traduce HTTP <-> Service. No contiene reglas de negocio ni SQL — solo lee
 * el request, llama al service correspondiente, y da forma a la respuesta.
 */
const favoritosService = require('../services/favoritosService');

async function listar(req, res, next) {
  try {
    const { firebaseUid } = req.params;
    const favoritos = await favoritosService.listar(firebaseUid);
    res.status(200).json({ favoritos });
  } catch (err) {
    next(err);
  }
}

async function agregar(req, res, next) {
  try {
    const favorito = await favoritosService.agregar(req.body);
    res.status(201).json({ favorito });
  } catch (err) {
    next(err);
  }
}

async function eliminar(req, res, next) {
  try {
    const { favoritoId } = req.params;
    const { firebaseUid } = req.body;
    await favoritosService.eliminar({ firebaseUid, favoritoId: Number(favoritoId) });
    res.status(200).json({ eliminado: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, agregar, eliminar };
