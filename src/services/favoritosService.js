/**
 * Lógica de negocio de "favoritos": valida entradas y decide qué hacer.
 * No sabe nada de HTTP (eso es del controller) ni de SQL (eso es del
 * repository) — cumple el Principio de Responsabilidad Única (SRP): esta
 * capa solo se encarga de las reglas de negocio de favoritos.
 */
const favoritosRepository = require('../repositories/favoritosRepository');

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

async function asegurarUsuario(firebaseUid, nombre) {
  if (!firebaseUid) {
    throw new ValidationError('firebaseUid es requerido.');
  }
  return favoritosRepository.crearUsuarioSiNoExiste(firebaseUid, nombre || 'Usuario');
}

async function listar(firebaseUid) {
  if (!firebaseUid) {
    throw new ValidationError('firebaseUid es requerido.');
  }
  const usuarioId = await favoritosRepository.obtenerUsuarioIdPorFirebaseUid(firebaseUid);
  if (!usuarioId) return [];
  return favoritosRepository.listarPorUsuario(usuarioId);
}

async function agregar({ firebaseUid, nombre, productoId, nombreProducto }) {
  if (!firebaseUid || !productoId || !nombreProducto) {
    throw new ValidationError('firebaseUid, productoId y nombreProducto son requeridos.');
  }
  const usuarioId = await asegurarUsuario(firebaseUid, nombre);
  const favorito = await favoritosRepository.agregar(usuarioId, productoId, nombreProducto);
  if (!favorito) {
    throw new ValidationError('Ese producto ya está en favoritos.');
  }
  return favorito;
}

async function eliminar({ firebaseUid, favoritoId }) {
  if (!firebaseUid || !favoritoId) {
    throw new ValidationError('firebaseUid y favoritoId son requeridos.');
  }
  const usuarioId = await favoritosRepository.obtenerUsuarioIdPorFirebaseUid(firebaseUid);
  if (!usuarioId) {
    throw new ValidationError('Usuario no encontrado.');
  }
  const eliminado = await favoritosRepository.eliminar(usuarioId, favoritoId);
  if (!eliminado) {
    throw new ValidationError('Favorito no encontrado.');
  }
  return true;
}

module.exports = { asegurarUsuario, listar, agregar, eliminar, ValidationError };
