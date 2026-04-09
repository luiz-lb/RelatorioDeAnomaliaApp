import express from 'express';
import * as authController from '../controllers/authController.js';

const router = express.Router();

// Rota para a página inicial
router.get('/', authController.paginaLogin);

export default router;