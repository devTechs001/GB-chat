// server/routes/systemRoutes.js
import express from 'express';
import {
  liveness,
  readiness,
  systemInfo,
  systemMetrics,
  resetSystemMetrics,
  presenceLookup,
  internalNotify,
} from '../controllers/systemController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Probes (unauthenticated, throttled by the global limiter only)
router.get('/live', liveness);
router.get('/ready', readiness);

// Diagnostics (admin/operator surface — requires auth)
router.get('/info', protect, systemInfo);
router.get('/metrics', protect, systemMetrics);
router.post('/metrics/reset', protect, resetSystemMetrics);
router.get('/presence/:userId', protect, presenceLookup);
router.post('/notify', protect, internalNotify);

export default router;
