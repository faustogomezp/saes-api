const express = require('express');
const router = express.Router();
const saesController = require('../controllers/saes.controller');
const { auth } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/roles.middleware');


router.get('/', auth, saesController.getAll);
router.get('/:id', auth, saesController.getById);
router.post('/', auth, allowRoles('TECNICO'), saesController.create);
router.put('/:id/retirar',auth, allowRoles('TECNICO'), saesController.retirar);
router.get('/export/excel', auth, saesController.exportExcel);

module.exports = router;