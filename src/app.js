import 'dotenv/config';
import helmet from 'helmet';
import express from 'express';
import cors from 'cors';

import saesRoutes from './routes/saes.routes.js';
import usuariosRoutes from './routes/usuarios.routes.js';
import authRoutes from './routes/auth.routes.js';
import auditoriaRoutes from './routes/auditoria.routes.js';
import camposRoutes from './routes/campos.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';

const app = express();


app.use(cors({
  origin: ['http://localhost:5173',
    'https://saes-frontend.vercel.app/'
  ],
  credentials: true
}));

app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false
  })
);

app.use(express.json());

app.use('/api/saes', saesRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/auditoria', auditoriaRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/campos', camposRoutes);
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

export default app;