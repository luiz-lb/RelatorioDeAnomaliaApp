import express from 'express';
import * as fiscalizacaoController from '../controllers/fiscalizacaoController.js';
import * as authController from '../controllers/authController.js';

const router = express.Router();

router.use(authController.Terceiro);

router.get('/', fiscalizacaoController.paginaHome);
router.get('/novo', fiscalizacaoController.paginaNovoRelatorio);
router.post('/novo', fiscalizacaoController.salvarNovoRelatorio);
router.get('/edit/:id', fiscalizacaoController.paginaEditarRelatorio);

export default router;