import express from 'express';
import { getIdentifyContactController, identifyContactController } from '../controllers/contactController.js';

const router = express.Router();

router.post('/', identifyContactController);
router.get('/', getIdentifyContactController);

export default router;
