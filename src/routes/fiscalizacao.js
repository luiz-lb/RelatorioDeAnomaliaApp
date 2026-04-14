import express from 'express';
import * as fiscalController from '../controllers/fiscalController.js';
import * as authController from '../controllers/authController.js';

const router = express.Router();

router.use(authController.Terceiro);

router.get('/', fiscalController.paginaHome);
router.get('/novo', fiscalController.paginaNovoRelatorio);
router.get('/edit/:id', fiscalController.paginaEditarRelatorio);

export default router;