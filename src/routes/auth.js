import express from 'express';
import * as syncController from '../controllers/syncController.js';

const router = express.Router();

// Rota para a página inicial
router.get('/', syncController.paginaLogin);
router.post('/auth/login', syncController.login);

export default router;