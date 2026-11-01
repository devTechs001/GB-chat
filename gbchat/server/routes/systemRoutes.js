// server/routes/systemRoutes.js
import express from 'express';
import {
  liveness,
  readiness,
  systemInfo,
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
router.get('/presence/:userId', protect, presenceLookup);
router.post('/notify', protect, internalNotify);

export default router;
