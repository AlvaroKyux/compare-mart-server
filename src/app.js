const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const favoritosRoutes = require('./routes/favoritosRoutes');
const comparacionesRoutes = require('./routes/comparacionesRoutes');
const reportesRoutes = require('./routes/reportesRoutes');
const sucursalesRoutes = require('./routes/sucursalesRoutes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check — útil para verificar que el despliegue (Fase 5) está vivo.
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', servicio: 'compare-mart-server' });
});

app.use('/api/favoritos', favoritosRoutes);
app.use('/api/comparaciones', comparacionesRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/sucursales', sucursalesRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
