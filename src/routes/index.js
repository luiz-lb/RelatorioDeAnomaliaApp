import express from 'express';
import fiscalizacao from './fiscalizacao.js';
import adm from './adm.js';
import auth from './auth.js';

const router = express.Router();

// Rota para a página inicial
router.use('/', auth);

// Rota para a página de administradores
router.use('/adm', adm);

// Rota para a página de fiscais
router.use('/fiscalizacao', fiscalizacao);

export default router;