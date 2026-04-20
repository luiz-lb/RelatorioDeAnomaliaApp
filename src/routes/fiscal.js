import express from 'express';
import * as syncController from '../controllers/syncController.js';

const router = express.Router();

router.get('/', syncController.paginaHome);

export default router;