import { Router } from 'express';
import { getDashboardSummary, getReconciliationReport, getAuditLogs, getUsers } from '../controllers/report.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/summary', authenticate, getDashboardSummary);
router.get('/reconciliation', authenticate, authorize(['ADMIN', 'PHARMACIST']), getReconciliationReport);
router.get('/audit-logs', authenticate, authorize(['ADMIN', 'PHARMACIST']), getAuditLogs);
router.get('/users', authenticate, authorize(['ADMIN']), getUsers);

export default router;
