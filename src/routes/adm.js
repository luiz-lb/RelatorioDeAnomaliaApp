import express from 'express';
import * as userController from '../controllers/userController.js';
import * as authController from '../controllers/authController.js';

const router = express.Router();

router.use(authController.apenasEverest);

router.get('/', userController.paginaUsuarios);
router.get('/user/edit/:id', userController.editarUsuario);
router.get('/user/new', userController.novoUsuario);
router.put('/user/:id', userController.atualizarUsuario);
router.post('/user', userController.criarUsuario);
router.post('/logout', authController.logout);

export default router;