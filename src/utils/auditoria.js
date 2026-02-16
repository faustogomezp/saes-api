import pool from '../config/db.js';

export const registrarAuditoria = async ({
  saes_id,
  usuario_id,
  rol,
  accion,
  detalle = null,
  numero_orden
}) => {
  await pool.query(
    `INSERT INTO saes.auditoria_saes
     (saes_id, usuario_id, rol, accion, detalle, numero_orden)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [saes_id, usuario_id, rol, accion, detalle, numero_orden]
  );
};

export const registrarAuditoriaUsuario = async ({
  usuario_afectado_id,
  usuario_ejecutor_id,
  accion,
  detalle
}) => {
  await pool.query(
    `INSERT INTO saes.auditoria_usuarios
     (usuario_afectado_id, usuario_ejecutor_id, accion, detalle)
     VALUES ($1, $2, $3, $4)`,
    [usuario_afectado_id, usuario_ejecutor_id, accion, detalle]
  );
};
