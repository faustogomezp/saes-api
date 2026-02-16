import express from 'express';
import {Router} from 'express';
import pool from '../config/db.js';
import { auth } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', auth, async (req, res) => {
  const result = await pool.query(
    'SELECT id, nombre FROM saes.campos WHERE activo = true ORDER BY nombre'
  );
  res.json(result.rows);
});

export default router;