import express from 'express';
import {
  getAllActivityLogs,
  getMyActivityLogs,
  createActivityLog,
  getActivityStats
} from '../controller/ActivityLogController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

// Admin only routes
router.route('/')
  .get(restrictTo('admin'), getAllActivityLogs)
  .post(createActivityLog);

router.get('/stats', restrictTo('admin'), getActivityStats);

// User's own activity logs
router.get('/me/activity-logs', getMyActivityLogs);

export default router;
