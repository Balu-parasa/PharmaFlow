import { Router } from 'express';
import { createSale, returnSale, getSalesHistory, getSaleById } from '../controllers/sale.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createSaleSchema } from '../schemas/index.js';

const router = Router();

router.post('/', authenticate, validate(createSaleSchema), createSale);
router.post('/:id/return', authenticate, authorize(['ADMIN', 'PHARMACIST']), returnSale);
router.get('/', authenticate, getSalesHistory);
router.get('/:id', authenticate, getSaleById);

export default router;
