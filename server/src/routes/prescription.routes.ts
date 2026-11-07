import { Router } from 'express';
import { getPrescriptions, createPrescription } from '../controllers/prescription.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { prescriptionSchema } from '../schemas/index.js';

const router = Router();

router.get('/', authenticate, getPrescriptions);
router.post('/', authenticate, authorize(['ADMIN', 'PHARMACIST']), validate(prescriptionSchema), createPrescription);

export default router;

