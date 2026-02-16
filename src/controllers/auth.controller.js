import pool from '../config/db.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y password requeridos' });
  }

  try {
const result = await pool.query(
  `SELECT id, nombre, rol, password, must_change_password
   FROM saes.usuarios
   WHERE username = $1`,
  [username]
);
    if (result.rowCount === 0) {
      return res.status(401).json({ error: 'Usuario no válido' });
    }

    const user = result.rows[0];

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Password incorrecto' });
    }

    const token = jwt.sign(
      { id: user.id, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      token,
      usuario: {
        id: user.id,
        nombre: user.nombre,
        rol: user.rol,
        mustChangePassword: user.must_change_password
      }
    });



  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};