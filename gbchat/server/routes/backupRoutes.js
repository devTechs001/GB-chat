import express from 'express';
import {
  createBackup,
  getBackups,
  getBackupDetails,
  restoreBackup,
  deleteBackup,
  exportBackup,
  scheduleBackup,
  cancelScheduledBackup,
  emailBackup,
  getBackupStats
} from '../controllers/backupController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// ============================================================================
// Backup Management
// ============================================================================
router.post('/', createBackup);
router.get('/', getBackups);
router.get('/stats', getBackupStats);
router.get('/:backupId', getBackupDetails);
router.post('/restore', restoreBackup);
router.delete('/:backupId', deleteBackup);
router.get('/:backupId/export', exportBackup);

// ============================================================================
// Scheduled Backups
// ============================================================================
router.post('/schedule', scheduleBackup);
router.post('/schedule/cancel', cancelScheduledBackup);

// ============================================================================
// Email Backup
// ============================================================================
router.post('/email', emailBackup);

export default router;
