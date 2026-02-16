import app from './src/app.js';

import pool from './src/config/db.js';

pool.query('SELECT 1')
  .then(() => console.log('🟢 PostgreSQL responde correctamente'))
  .catch(err => console.error('🔴 Error PostgreSQL', err.message));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🔥 API SAES corriendo en puerto ${PORT}`);
});