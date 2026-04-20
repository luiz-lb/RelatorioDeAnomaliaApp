import express from 'express';
import { handleUpload } from '../config/configMulter.js';
import * as fiscalizacaoController from '../controllers/fiscalizacaoController.js';
import * as authController from '../controllers/authController.js';

const router = express.Router();

router.use(authController.Terceiro);

router.get('/', fiscalizacaoController.paginaHome);
router.get('/novo', fiscalizacaoController.paginaNovoRelatorio);
router.post('/novo', fiscalizacaoController.salvarNovoRelatorio);
router.get('/edit/:id', fiscalizacaoController.paginaEditarRelatorio);
router.post('/edit/nao-conformidade/:idRelatorio', handleUpload('arquivo'), fiscalizacaoController.envioNaoConformidade);
router.put('/edit/nao-conformidade/:idRelatorio', fiscalizacaoController.editarNaoConformidade);
router.delete('/edit/nao-conformidade/:idRelatorio', fiscalizacaoController.excluirNaoConformidade);

export default router;