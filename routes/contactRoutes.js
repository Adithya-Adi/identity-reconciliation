import express from 'express';
import { identifyContactController } from '../controllers/contactController.js';

const router = express.Router();

router.get('/', identifyContactController);

export default router;