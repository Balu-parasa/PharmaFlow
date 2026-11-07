import { Router } from 'express';
import {
  getBatches,
  addBatch,
  adjustStock,
  getExpiryAlerts,
  getStockMovements
} from '../controllers/inventory.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { batchSchema } from '../schemas/index.js';

const router = Router();

router.get('/batches', authenticate, getBatches);
router.get('/alerts/expiry', authenticate, getExpiryAlerts);
router.get('/movements', authenticate, getStockMovements);
router.post('/batches', authenticate, authorize(['ADMIN', 'PHARMACIST']), validate(batchSchema), addBatch);
router.patch('/batches/:id/adjust', authenticate, authorize(['ADMIN', 'PHARMACIST']), adjustStock);

export default router;
