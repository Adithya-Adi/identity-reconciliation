import express from 'express';
import { identifyContactController } from '../controllers/contactController.js';

const router = express.Router();

router.post('/', identifyContactController);

export default router;