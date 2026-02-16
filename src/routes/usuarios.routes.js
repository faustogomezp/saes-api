require('dotenv').config();
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const usuariosController = require('../controllers/usuarios.controller');
const { auth } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/roles.middleware');

router.get('/', 
  auth, 
  allowRoles('ADMIN'), 
  usuariosController.getAll
);

router.get('/aa', auth, async (req, res) => {
  const result = await pool.query(
    "SELECT id, nombre FROM saes.usuarios WHERE rol = 'AA'"
  );
  res.json(result.rows);
});

router.post(
  '/', 
  auth, 
  allowRoles('ADMIN'),
    usuariosController.create
);

router.patch('/:id/activo',
  auth,
  allowRoles('ADMIN'),
  usuariosController.toggleActivo
);

router.patch('/:id/reset-password',
  auth,
  allowRoles('ADMIN'),
  usuariosController.resetPassword
);

module.exports = router;