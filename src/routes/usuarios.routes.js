import  express from 'express';
import {Router} from 'express';
import pool from '../config/db.js';
import {getAll, create, toggleActivo, resetPassword} from '../controllers/usuarios.controller.js';
import { auth } from '../middlewares/auth.middleware.js';
import { allowRoles } from '../middlewares/roles.middleware.js';

const router = Router();

router.get('/', 
  auth, 
  allowRoles('ADMIN'), 
  getAll
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
    create
);

router.patch('/:id/activo',
  auth,
  allowRoles('ADMIN'),
  toggleActivo
);

router.patch('/:id/reset-password',
  auth,
  allowRoles('ADMIN'),
  resetPassword
);

export default router;