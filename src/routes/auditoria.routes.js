import express from 'express';
import {Router} from 'express';
import {getBySaes,exportExcel } from '../controllers/auditoria.controller.js';
import { auth } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/:saes_id', auth, getBySaes);
router.get('/export/excel', auth, exportExcel);

export default router;