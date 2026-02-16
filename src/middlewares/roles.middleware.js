export const allowRoles = (...roles) => {
  return (req, res, next) => {
    // auth middleware debe haber cargado req.user
    if (!req.user || !req.user.rol) {
      return res.status(401).json({
        error: 'Usuario no autenticado'
      });
    }

    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({
        error: 'No tiene permisos para esta acción'
      });
    }

    next();
  };
};