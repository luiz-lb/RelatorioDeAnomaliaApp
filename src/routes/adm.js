import express from 'express';
import * as syncController from '../controllers/syncController.js';

const router = express.Router();

router.get('/', syncController.paginaUsuarios);
router.get('/user/edit/:id', syncController.editarUsuario);
router.get('/user/new', syncController.novoUsuario);
router.put('/user/:id', syncController.atualizarUsuario);
router.post('/user', syncController.criarUsuario);

export default router;