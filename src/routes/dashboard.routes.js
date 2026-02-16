const express = require('express');
const router = express.Router();
const controller = require('../controllers/dashboard.controller');
const { auth } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/roles.middleware');

router.get('/saes', auth, allowRoles('ADMIN', 'SUPERVISOR'), controller.getDashboardSaes);
router.get('/saes/semaforo', auth, controller.getSemaforoSaes);
router.get('/saes/campo', auth, controller.getSaesPorCampo);
router.get('/saes/tecnico', auth, controller.getSaesPorTecnico);


module.exports = router;