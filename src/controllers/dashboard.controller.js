const pool = require('../config/db');



exports.getDashboardSaes = async (req, res) => {
  try {
    const result = await pool.query(`
 SELECT
  COUNT(*) FILTER (WHERE estado = 'INSTALADO') AS instalados,
  COUNT(*) FILTER (WHERE estado = 'RETIRADO') AS retirados,

  COUNT(*) FILTER (
    WHERE estado = 'INSTALADO'
    AND CURRENT_DATE - fecha_instalacion::date >= 30
  ) AS criticos,

  COUNT(*) FILTER (
    WHERE estado = 'INSTALADO'
    AND CURRENT_DATE - fecha_instalacion::date BETWEEN 15 AND 29
  ) AS advertencia,

  ROUND(
    AVG(CURRENT_DATE - fecha_instalacion::date)
    FILTER (WHERE estado = 'INSTALADO')
  ) AS antiguedad_promedio

FROM saes.saes;
`);

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSaesPorCampo = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        campo,
        COUNT(*) AS total
      FROM saes.saes
      WHERE estado = 'INSTALADO'
      GROUP BY campo
      ORDER BY total DESC
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSaesPorTecnico = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        u.nombre AS tecnico,
        COUNT(*) AS total
      FROM saes.saes s
      JOIN saes.usuarios u ON s.tecnico_id = u.id
      WHERE s.estado = 'INSTALADO'
      GROUP BY u.nombre
      ORDER BY total DESC
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSemaforoSaes = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) FILTER (
          WHERE estado = 'INSTALADO'
          AND CURRENT_DATE - fecha_instalacion::date >= 30
        ) AS critico,

        COUNT(*) FILTER (
          WHERE estado = 'INSTALADO'
          AND CURRENT_DATE - fecha_instalacion::date BETWEEN 15 AND 29
        ) AS advertencia,

        COUNT(*) FILTER (
          WHERE estado = 'INSTALADO'
          AND CURRENT_DATE - fecha_instalacion::date < 15
        ) AS normal

      FROM saes.saes
    `);

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};