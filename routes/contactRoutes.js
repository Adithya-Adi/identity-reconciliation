import express from 'express';
import { identifyContactController, identifyContactQueryController } from '../controllers/contactController.js';

const router = express.Router();

router.post('/', identifyContactController);
router.get('/', identifyContactQueryController);

export default router;
