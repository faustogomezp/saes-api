const express = require('express');
const router = express.Router();
const auditoriaController = require('../controllers/auditoria.controller');
const { auth } = require('../middlewares/auth.middleware');

router.get('/:saes_id', auth, auditoriaController.getBySaes);
router.get('/export/excel', auth, auditoriaController.exportExcel);

module.exports = router;