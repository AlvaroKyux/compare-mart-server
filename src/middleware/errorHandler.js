/**
 * Manejador de errores centralizado. Los controllers hacen next(err) y todo
 * termina aquí — así ningún controller repite lógica de "cómo formatear un
 * error" (otra aplicación de SRP).
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const statusCode = err.statusCode || 500;
  const mensaje = statusCode === 500 ? 'Error interno del servidor.' : err.message;

  if (statusCode === 500) {
    console.error('Error no controlado:', err);
  }

  res.status(statusCode).json({ error: mensaje });
}

function notFoundHandler(req, res) {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
}

module.exports = { errorHandler, notFoundHandler };
