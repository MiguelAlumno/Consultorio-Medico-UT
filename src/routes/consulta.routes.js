// src/routes/consulta.routes.js
const express = require('express');
const router = express.Router();

// Importamos el guardia y el controlador
const { verificarToken } = require('../middlewares/auth.middleware');
const { obtenerHistorialConsultas } = require('../controllers/consulta.controller');

// Definimos la ruta de historial protegida por el token
router.get('/historial', verificarToken, obtenerHistorialConsultas);


module.exports = router;