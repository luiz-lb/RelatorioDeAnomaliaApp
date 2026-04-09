import express from 'express';
import * as fiscalController from '../controllers/fiscalController.js';

const router = express.Router();

router.get('/', fiscalController.paginaHome);
router.get('/novo', fiscalController.paginaNovoRelatorio);
router.get('/edit/:id', fiscalController.paginaEditarRelatorio);

export default router;