const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

pool.query('SELECT 1')
.then(() => console.log('Neon Conectado correctamente'))
.catch(err => console.error('Error Neon', err.message)
);
pool.on('connect', () => {
  console.log('🟢 Conectado a PostgreSQL');
});

module.exports = pool;