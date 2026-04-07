import express from 'express';
import * as syncController from '../controllers/syncController.js';

const router = express.Router();

router.get('/', syncController.paginaUsuarios);
router.get('/editar/:id', syncController.editarUsuario);
router.get('/new', syncController.novoUsuario);

export default router;