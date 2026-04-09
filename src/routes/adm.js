import express from 'express';
import * as userController from '../controllers/userController.js';

const router = express.Router();

router.get('/', userController.paginaUsuarios);
router.get('/user/edit/:id', userController.editarUsuario);
router.get('/user/new', userController.novoUsuario);
router.put('/user/:id', userController.atualizarUsuario);
router.post('/user', userController.criarUsuario);

export default router;