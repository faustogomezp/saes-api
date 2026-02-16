const pool = require('../config/db');
const ExcelJS = require('exceljs');
const { registrarAuditoria } = require('../utils/auditoria');

exports.getById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT *
       FROM saes.vw_saes_reportes
       WHERE id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: 'SAES no encontrado'
      });
    }

    res.json(result.rows[0]);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const {
      numero_saes,
      numero_orden,
      estado,
      campo,
      tecnico,
      desde,
      hasta,
      semaforo
    } = req.query;



    // 1️⃣ Query base
    let query = `
      SELECT *
      FROM saes.vw_saes_reportes
      WHERE 1 = 1
    `;

    const values = [];
    let index = 1;

    // 🔴🟡🟢 FILTRO SEMÁFORO (PRIMERO, ES PRIORITARIO)
    if (semaforo === 'CRITICO') {
      query += `
        AND estado = 'INSTALADO'
        AND CURRENT_DATE - fecha_instalacion::date >= 30
      `;
    }

    if (semaforo === 'ADVERTENCIA') {
      query += `
        AND estado = 'INSTALADO'
        AND CURRENT_DATE - fecha_instalacion::date BETWEEN 15 AND 29
      `;
    }

    if (semaforo === 'NORMAL') {
      query += `
        AND estado = 'INSTALADO'
        AND CURRENT_DATE - fecha_instalacion::date < 15
      `;
    }

    // 🔢 Número SAES
    if (numero_saes) {
      query += ` AND numero_saes = $${index++}`;
      values.push(numero_saes);
    }

    // 🔄 Estado
    if (estado) {
      query += ` AND estado = $${index++}`;
      values.push(estado);
    }

    // 📍 Campo
    if (campo) {
      query += ` AND campo = $${index++}`;
      values.push(campo);
    }

    // 👷 Técnico
    if (tecnico) {
      query += ` AND tecnico_instala = $${index++}`;
      values.push(tecnico);
    }

    // 📅 Rango de fechas
    if (desde && hasta) {
      query += ` AND fecha_instalacion BETWEEN $${index++} AND $${index++}`;
      values.push(desde, hasta);
    }

    query += ` ORDER BY created_at DESC`;

    const result = await pool.query(query, values);
    res.json(result.rows);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.exportExcel = async (req, res) => {
  try {
    const {
      numero_saes,
      numero_orden,
      estado,
      campo,
      desde,
      hasta
    } = req.query;

    let query = `
      SELECT
        numero_saes,
        numero_orden_instalacion,
        numero_orden_retiro,
        campo,
        equipo,
        actividad,
        estado,
        fecha_instalacion,
        fecha_retiro,
        tecnico_instala,
        aa_instala
      FROM saes.vw_saes_reportes
      WHERE 1 = 1
    `;

    const values = [];
    let index = 1;

    if (numero_saes) {
      query += ` AND numero_saes ILIKE $${index++}`;
      values.push(`%${numero_saes}%`);
    }

    if (numero_orden) {
      query += `
    AND (
      numero_orden_instalacion ILIKE $${index}
      OR numero_orden_retiro ILIKE $${index}
    )
  `;
      values.push(`%${numero_orden}%`);
      index++;
    }

    if (estado) {
      query += ` AND estado = $${index++}`;
      values.push(estado);
    }

    if (campo) {
      query += ` AND campo = $${index++}`;
      values.push(campo);
    }

    if (desde && hasta) {
      query += ` AND fecha_instalacion BETWEEN $${index++} AND $${index++}`;
      values.push(desde, `${hasta} 23:59:59`);
    }

    query += ` ORDER BY created_at DESC`;

    const result = await pool.query(query, values);

    // 📘 Crear Excel
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('SAES');

    sheet.columns = [
      { header: 'N° SAES', key: 'numero_saes', width: 18 },
      { header: 'N° Orden Instalación', key: 'numero_orden_instalacion', width: 20 },
      { header: 'N° Orden Retiro', key: 'numero_orden_retiro', width: 20 },
      { header: 'Campo', key: 'campo', width: 18 },
      { header: 'Equipo', key: 'equipo', width: 18 },
      { header: 'Actividad', key: 'actividad', width: 25 },
      { header: 'Estado', key: 'estado', width: 14 },
      { header: 'Fecha Instalación', key: 'fecha_instalacion', width: 18 },
      { header: 'Fecha Retiro', key: 'fecha_retiro', width: 18 },
      { header: 'Técnico', key: 'tecnico_instala', width: 20 },
      { header: 'AA', key: 'aa_instala', width: 20 }
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
      'attachment; filename=SAES.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  const {
    numero_saes,
    numero_orden,
    campo,
    equipo,
    actividad,
    tecnico_id,
    aa_id
  } = req.body;

  // 1️⃣ Validaciones básicas
  if (
    !numero_saes ||
    !numero_orden ||
    !campo ||
    !equipo ||
    !actividad ||
    !tecnico_id ||
    !aa_id
  ) {
    return res.status(400).json({
      error: 'Todos los campos son obligatorios para crear un SAES'
    });
  }

  try {
    // 2️⃣ Validar número SAES único
    const existe = await pool.query(
      'SELECT 1 FROM saes.saes WHERE numero_saes = $1',
      [numero_saes]
    );

    if (existe.rowCount > 0) {
      return res.status(400).json({
        error: `Ya existe un SAES con el número ${numero_saes}`
      });
    }

    const existeOm = await pool.query(
      'SELECT 1 FROM saes.saes WHERE numero_orden = $1 AND estado = $2',
      [numero_orden, 'INSTALADO']
    );

    if (existeOm.rowCount > 0) {
      return res.status(400).json({
        error: 'Ya existe un SAES INSTALADO con este número de orden'
      });
    }

    // 3️⃣ Insertar SAES
    const result = await pool.query(
      `INSERT INTO saes.saes (
        numero_saes,
        numero_orden,
        campo,
        equipo,
        actividad,
        tecnico_id,
        aa_id,
        estado
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,'INSTALADO')
      RETURNING *`,
      [
        numero_saes,
        numero_orden,
        campo,
        equipo,
        actividad,
        tecnico_id,
        aa_id
      ]
    );

    await registrarAuditoria({
      saes_id: result.rows[0].id,
      usuario_id: req.user.id,
      rol: req.user.rol,
      accion: 'CREAR_SAES',
      detalle: `Creación SAES ${numero_saes}`,
      numero_orden: numero_orden
    });

    res.status(201).json({
      message: 'SAES creado correctamente',
      saes: result.rows[0]
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.retirar = async (req, res) => {
  const { id } = req.params;
  const { tecnico_retiro_id, aa_retiro_id, numero_orden } = req.body;

  if (!tecnico_retiro_id || !aa_retiro_id || !numero_orden) {
    return res.status(400).json({
      error: 'Debe indicar el número de orden / Aviso y el AA que autorizan el retiro'
    });
  }

  try {
    // 1️⃣ Verificar que el SAES exista y no esté retirado
    const saesResult = await pool.query(
      'SELECT estado, numero_orden FROM saes.saes WHERE id = $1',
      [id]
    );

    if (saesResult.rowCount === 0) {
      return res.status(404).json({ error: 'SAES no encontrado' });
    }



    if (saesResult.rows[0].estado === 'RETIRADO') {
      return res.status(400).json({ error: 'El SAES ya se encuentra retirado' });
    }

    const ordenRetiroResult = await pool.query(
      'SELECT numero_orden_retiro FROM saes.saes WHERE numero_orden_retiro = $1',
      [numero_orden]
    );

    if (ordenRetiroResult.rowCount > 0) {
      return res.status(400).json({ error: 'La orden ya fue usada en el retiro de un SAES' });
    }



    // 2️⃣ Actualizar el SAES (retiro)
    const updateResult = await pool.query(
      `UPDATE saes.saes
       SET estado = 'RETIRADO',
           fecha_retiro = CURRENT_DATE,
           tecnico_retiro_id = $2,
           aa_retiro_id = $3,
           numero_orden_retiro = $4
       WHERE id = $1
       RETURNING *`,
      [id, tecnico_retiro_id, aa_retiro_id, numero_orden]
    );

    await registrarAuditoria({
      saes_id: updateResult.rows[0].id,
      usuario_id: req.user.id,
      rol: req.user.rol,
      accion: 'RETIRAR_SAES',
      detalle: `Retiro SAES ${updateResult.rows[0].numero_saes}`,
      numero_orden: numero_orden
    });

    res.json({
      message: 'SAES retirado correctamente',
      saes: updateResult.rows[0]
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};