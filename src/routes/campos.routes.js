const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { auth } = require('../middlewares/auth.middleware');

router.get('/', auth, async (req, res) => {
  const result = await pool.query(
    'SELECT id, nombre FROM saes.campos WHERE activo = true ORDER BY nombre'
  );
  res.json(result.rows);
});

module.exports = router;