import { Router } from 'express';
import { getSuppliers, createSupplier, getPurchaseOrders, createPurchaseOrder } from '../controllers/supplier.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { supplierSchema } from '../schemas/index.js';

const router = Router();

router.get('/', authenticate, getSuppliers);
router.post('/', authenticate, authorize(['ADMIN', 'PHARMACIST']), validate(supplierSchema), createSupplier);
router.get('/purchases', authenticate, authorize(['ADMIN', 'PHARMACIST']), getPurchaseOrders);
router.post('/purchases', authenticate, authorize(['ADMIN', 'PHARMACIST']), createPurchaseOrder);

export default router;
