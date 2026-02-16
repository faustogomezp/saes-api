import express from 'express';
import {Router}  from  'express';
import {login} from '../controllers/auth.controller.js';
import {changePassword} from '../controllers/usuarios.controller.js';
import {auth} from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/login', login);

router.patch('/change-password', auth, changePassword);

export default router;