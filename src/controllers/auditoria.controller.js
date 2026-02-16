const pool = require('../config/db');
const ExcelJS = require('exceljs');

exports.getBySaes = async (req, res) => {
  const { saes_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT
         a.fecha,
         u.nombre,
         a.rol,
         a.accion,
         a.detalle
       FROM saes.auditoria_saes a
       JOIN saes.usuarios u ON u.id = a.usuario_id
       WHERE a.saes_id = $1
       ORDER BY a.fecha ASC`,
      [saes_id]
    );

    res.json(result.rows);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.exportExcel = async (req, res) => {
  try {
    const {
      saes_id,
      usuario,
      rol,
      accion,
      desde,
      hasta
    } = req.query;

    let query = `
      SELECT
        a.fecha,
        s.numero_saes,
        u.nombre AS usuario,
        a.rol,
        a.accion,
        a.detalle
      FROM saes.auditoria_saes a
      LEFT JOIN saes.saes s ON a.saes_id = s.id
      LEFT JOIN saes.usuarios u ON a.usuario_id = u.id
      WHERE 1 = 1
    `;

    const values = [];
    let index = 1;

    if (saes_id) {
      query += ` AND a.saes_id = $${index++}`;
      values.push(saes_id);
    }

    if (usuario) {
      query += ` AND u.nombre ILIKE $${index++}`;
      values.push(`%${usuario}%`);
    }

    if (rol) {
      query += ` AND a.rol = $${index++}`;
      values.push(rol);
    }

    if (accion) {
      query += ` AND a.accion = $${index++}`;
      values.push(accion);
    }

    if (desde && hasta) {
      query += ` AND a.fecha BETWEEN $${index++} AND $${index++}`;
      values.push(desde, `${hasta} 23:59:59`);
    }

    query += ` ORDER BY a.fecha DESC`;

    const result = await pool.query(query, values);

    // 📘 Crear Excel
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Auditoría SAES');

    sheet.columns = [
      { header: 'Fecha', key: 'fecha', width: 22 },
      { header: 'N° SAES', key: 'numero_saes', width: 18 },
      { header: 'Usuario', key: 'usuario', width: 20 },
      { header: 'Rol', key: 'rol', width: 14 },
      { header: 'Acción', key: 'accion', width: 20 },
      { header: 'Detalle', key: 'detalle', width: 40 }
    ];

    result.rows.forEach(row => {
      sheet.addRow(row);
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=Auditoria_SAES.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};