import express from 'express';
import * as fiscalController from '../controllers/fiscalController.js';

const router = express.Router();

router.get('/', fiscalController.paginaHome);

export default router;