import express from 'express';
import {Router} from 'express';
import {getAll, getById, create, retirar, exportExcel} from '../controllers/saes.controller.js';
import { auth } from '../middlewares/auth.middleware.js';
import { allowRoles } from '../middlewares/roles.middleware.js';

const router = Router();
router.get('/', auth, getAll);
router.get('/:id', auth, getById);
router.post('/', auth, allowRoles('TECNICO'), create);
router.put('/:id/retirar',auth, allowRoles('TECNICO'), retirar);
router.get('/export/excel', auth, exportExcel);

export default router;