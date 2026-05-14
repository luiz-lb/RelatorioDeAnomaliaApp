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
router.get('/edit/:idRelatorio/pdf', fiscalizacaoController.validarIdRelatorioParams, fiscalizacaoController.downloadRelatorioPDF);
router.post('/edit/nao-conformidade/:idRelatorio', fiscalizacaoController.validarIdRelatorioParams, handleUpload('arquivo'), fiscalizacaoController.envioNaoConformidade);
router.put('/edit/nao-conformidade/:idRelatorio', fiscalizacaoController.validarIdRelatorioParams, fiscalizacaoController.editarNaoConformidade);
router.delete('/edit/nao-conformidade/:idRelatorio', fiscalizacaoController.validarIdRelatorioParams, fiscalizacaoController.excluirNaoConformidade);
router.get('/checklist/:idRelatorio', fiscalizacaoController.pegarChecklistRelatorio);
router.post('/checklist-respostas/:idRelatorio', fiscalizacaoController.validarIdRelatorioParams, fiscalizacaoController.salvarChecklistRespostas);
router.post('/enviar-relatorio/:idRelatorio', fiscalizacaoController.validarIdRelatorioParams, fiscalizacaoController.enviarRelatorio);
router.put('/edit/header/:idRelatorio', fiscalizacaoController.validarIdRelatorioParams, fiscalizacaoController.editarHeaderFiscalizacao);

export default router;