import express from 'express';
import * as syncController from '../controllers/syncController.js';

const router = express.Router();
// Rota para a página inicial
router.get('/', (req, res) => {
    res.render('pages/index');
});

export default router;