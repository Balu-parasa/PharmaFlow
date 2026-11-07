import { Router } from 'express';
import { getDashboardSummary } from '../controllers/report.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/summary', authenticate, getDashboardSummary);

export default router;

