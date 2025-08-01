import { logActivity, getActivityLogs } from '../utils/activityLogger.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

/**
 * @desc    Get all activity logs (admin only)
 * @route   GET /api/activity-logs
 * @access  Private/Admin
 */
export const getAllActivityLogs = catchAsync(async (req, res, next) => {
  const { 
    userId, 
    action, 
    entityType, 
    startDate, 
    endDate, 
    page = 1, 
    limit = 10 
  } = req.query;

  const { logs, pagination } = await getActivityLogs({
    userId,
    action,
    entityType,
    startDate,
    endDate,
    page: parseInt(page, 10),
    limit: parseInt(limit, 10)
  });

  res.status(200).json({
    status: 'success',
    results: logs.length,
    pagination,
    data: {
      logs
    }
  });
});

/**
 * @desc    Get activity logs for current user
 * @route   GET /api/users/me/activity-logs
 * @access  Private
 */
export const getMyActivityLogs = catchAsync(async (req, res, next) => {
  const { 
    action, 
    entityType, 
    startDate, 
    endDate, 
    page = 1, 
    limit = 10 
  } = req.query;

  const { logs, pagination } = await getActivityLogs({
    userId: req.user._id,
    action,
    entityType,
    startDate,
    endDate,
    page: parseInt(page, 10),
    limit: parseInt(limit, 10)
  });

  res.status(200).json({
    status: 'success',
    results: logs.length,
    pagination,
    data: {
      logs
    }
  });
});

/**
 * @desc    Create a custom activity log
 * @route   POST /api/activity-logs
 * @access  Private
 */
export const createActivityLog = catchAsync(async (req, res, next) => {
  const { action, entityType, entityId, metadata, status } = req.body;
  
  if (!action || !entityType) {
    return next(new AppError('Action and entityType are required', 400));
  }

  const log = await logActivity({
    userId: req.user._id,
    action,
    entityType,
    entityId,
    metadata,
    status: status || 'SUCCESS',
    ipAddress: req.ip,
    userAgent: req.get('user-agent')
  });

  res.status(201).json({
    status: 'success',
    data: {
      log
    }
  });
});

/**
 * @desc    Get activity stats (admin only)
 * @route   GET /api/activity-logs/stats
 * @access  Private/Admin
 */
export const getActivityStats = catchAsync(async (req, res, next) => {
  const { startDate, endDate } = req.query;
  
  const match = {};
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
  }

  const stats = await ActivityLog.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          action: '$action',
          entityType: '$entityType',
          status: '$status'
        },
        count: { $sum: 1 },
        lastActivity: { $max: '$createdAt' }
      }
    },
    {
      $group: {
        _id: {
          action: '$_id.action',
          entityType: '$_id.entityType'
        },
        statuses: {
          $push: {
            status: '$_id.status',
            count: '$count',
            lastActivity: '$lastActivity'
          }
        },
        total: { $sum: '$count' }
      }
    },
    {
      $project: {
        _id: 0,
        action: '$_id.action',
        entityType: '$_id.entityType',
        statuses: 1,
        total: 1
      }
    },
    { $sort: { total: -1 } }
  ]);

  res.status(200).json({
    status: 'success',
    results: stats.length,
    data: {
      stats
    }
  });
});
