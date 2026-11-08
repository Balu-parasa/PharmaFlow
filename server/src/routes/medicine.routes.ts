import { Router } from 'express';
import {
  getMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  toggleMedicineStatus
} from '../controllers/medicine.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { medicineSchema } from '../schemas/index.js';

const router = Router();

router.get('/', authenticate, getMedicines);
router.get('/:id', authenticate, getMedicineById);
router.post('/', authenticate, authorize(['ADMIN', 'PHARMACIST']), validate(medicineSchema), createMedicine);
router.put('/:id', authenticate, authorize(['ADMIN', 'PHARMACIST']), updateMedicine);
router.patch('/:id/toggle-status', authenticate, authorize(['ADMIN', 'PHARMACIST']), toggleMedicineStatus);

export default router;
