const express = require('express');
const router = express.Router();
const backblazeController = require('../controllers/backblazeController');

// Middleware para registrar todas las solicitudes
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Rutas para las operaciones de archivos
router.get('/files', backblazeController.listFiles);
router.get('/files/:path(*)', backblazeController.getFile);
router.post('/files/:path(*)', backblazeController.uploadFile);
router.delete('/files/:path(*)', backblazeController.deleteFile);

// Ruta para verificar el estado de la conexión
router.get('/status', backblazeController.checkStatus);

module.exports = router;