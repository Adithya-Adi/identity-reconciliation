import express from 'express';
import {
  identifyContactController,
  getIdentifyContactController,
} from '../controllers/contactController.js';

const router = express.Router();

router.get('/', getIdentifyContactController);
router.post('/', identifyContactController);

export default router;