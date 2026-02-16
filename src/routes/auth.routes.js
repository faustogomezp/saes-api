const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const usuariosController = require('../controllers/usuarios.controller');
const {auth} = require('../middlewares/auth.middleware');

router.post('/login', authController.login);

router.patch('/change-password', auth, usuariosController.changePassword);

module.exports = router;