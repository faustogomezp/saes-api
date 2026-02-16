import express from 'express';
import {Router} from 'express';
import {getDashboardSaes, getSemaforoSaes,getSaesPorCampo, getSaesPorTecnico } from '../controllers/dashboard.controller.js';
import { auth } from '../middlewares/auth.middleware.js';
import { allowRoles } from '../middlewares/roles.middleware.js';

const router = Router();

router.get('/saes', auth, allowRoles('ADMIN', 'SUPERVISOR'), getDashboardSaes);
router.get('/saes/semaforo', auth, getSemaforoSaes);
router.get('/saes/campo', auth, getSaesPorCampo);
router.get('/saes/tecnico', auth, getSaesPorTecnico);


export default router;