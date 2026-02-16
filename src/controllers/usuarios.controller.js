const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const { registrarAuditoria, registrarAuditoriaUsuario } = require('../utils/auditoria');


exports.getAll = async (requestAnimationFrame, res) => {
    const result = await pool.query('SELECT id, username, nombre, rol, activo, created_at FROM saes.usuarios ORDER BY nombre');
    res.json(result.rows);
}

exports.create = async (req, res) => {
    const { username, nombre, rol, password } = req.body;

    if (!username || !nombre || !rol || !password) {
        return res.status(400).json({ error: 'Datos incompletos' });
    }
    try {
        const existe = await pool.query(
            'SELECT 1 FROM saes.usuarios WHERE username = $1',
            [username]
        );

        if (existe.rowCount > 0) {
            return res.status(400).json({
                error: `El usuario ya existe`
            });
        }

        const hash = await bcrypt.hash(password, 10);

       const result = await pool.query(
            `
    INSERT INTO saes.usuarios (username, nombre, rol, password)
    VALUES ($1,$2,$3,$4)
    RETURNING id
    `,
            [username, nombre, rol, hash]
        );

        const nuevoUsuarioId = result.rows[0].id;

        await registrarAuditoriaUsuario({
            usuario_afectado_id: nuevoUsuarioId,
            usuario_ejecutor_id: req.user.id,
            accion: 'CREAR_USUARIO',
            detalle: 'Usuario ${username}'
        });

        res.status(201).json({ message: 'Usuario creado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.toggleActivo = async (req, res) => {
    const { id } = req.params;

    if (id === req.user.id) {
        return res.status(400).json({
            error: 'No se puede desactivar su propio usuario'
        });
    }

    const result = await pool.query(
        `
    UPDATE saes.usuarios
    SET activo = NOT activo
    WHERE id = $1
    RETURNING activo
    `,
        [id]
    );

    const activo = result.rows[0].activo;

    await registrarAuditoriaUsuario({
        usuario_afectado_id: id,
        usuario_ejecutor_id: req.user.id,
        accion: activo ? 'ACTIVAR_USUARIO' : 'DESACTIVAR_USUARIO',
        detalle: activo ? 'Usuario Activado' : ' Usuario Desactivado'
    });

    res.json({ message: activo ? 'Usuario activado correctamente' : 'Usuario desactivado correctamente' });
};

exports.resetPassword = async (req, res) => {
    const { id } = req.params;
    const nueva = Math.random().toString(36).slice(-8);

    const hash = await bcrypt.hash(nueva, 10);


    await pool.query(
        'UPDATE saes.usuarios SET password = $1, must_change_password = true WHERE id = $2',
        [hash, id]
    );

    await registrarAuditoriaUsuario({
        usuario_afectado_id: id,
        usuario_ejecutor_id: req.user.id,
        accion: 'RESET_PASSWORD',
        detalle: 'Reset de Contraseña'
    });


    res.json({
        message: 'Password reseteado',
        passwordTemporal: nueva
    });
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Debe indicar la contraseña actual y la nueva'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        error: 'La nueva contraseña debe tener al menos 8 caracteres'
      });
    }

    // 1️⃣ Obtener usuario actual
    const result = await pool.query(
      `
      SELECT password
      FROM saes.usuarios
      WHERE id = $1
      `,
      [userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const hashActual = result.rows[0].password;

    // 2️⃣ Validar contraseña actual
    const ok = await bcrypt.compare(currentPassword, hashActual);

    if (!ok) {
      return res.status(401).json({
        error: 'La contraseña actual no es correcta'
      });
    }

    // 3️⃣ Hashear nueva contraseña
    const newHash = await bcrypt.hash(newPassword, 10);

    // 4️⃣ Actualizar password + flag
    await pool.query(
      `
      UPDATE saes.usuarios
      SET password = $1,
      must_change_password = false
      WHERE id = $2
      `,
      [newHash, userId]
    );

    // 5️⃣ Auditoría
    await registrarAuditoriaUsuario({
      usuario_afectado_id: userId,
      usuario_ejecutor_id: userId,
      accion: 'CHANGE_PASSWORD',
      detalle: 'Cambio obligatorio de contraseña'
    });

    res.json({
      message: 'Contraseña actualizada correctamente',
      mustChangePassword: false
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al cambiar la contraseña' });
  }
};
