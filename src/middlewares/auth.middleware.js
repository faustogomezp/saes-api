const jwt = require('jsonwebtoken');

exports.auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2) {
      return res.status(401).json({ error: 'Formato de token inválido' });
    }

    const [scheme, token] = parts;

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET no definido');
      return res.status(500).json({ error: 'Error de configuración del servidor' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();

  } catch (error) {
    console.error('Error en auth middleware:', error.message);
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};