import ActivityLog from '../model/ActivityLog.js';

/**
 * Logs a custom activity
 * @param {Object} options - Logging options
 * @param {string} options.userId - ID of the user performing the action
 * @param {string} options.action - Action performed (e.g., 'CREATE', 'UPDATE', 'DELETE')
 * @param {string} options.entityType - Type of entity being acted upon (e.g., 'USER', 'POST')
 * @param {string} [options.entityId] - ID of the entity being acted upon
 * @param {Object} [options.metadata] - Additional metadata to store with the log
 * @param {string} [options.ipAddress] - IP address of the requester
 * @param {string} [options.userAgent] - User agent string
 * @param {string} [options.status='SUCCESS'] - Status of the action ('SUCCESS', 'FAILURE', 'PENDING')
 * @returns {Promise<Object>} The created activity log
 */
const logActivity = async ({
  userId,
  action,
  entityType,
  entityId = null,
  metadata = {},
  ipAddress = null,
  userAgent = null,
  status = 'SUCCESS'
}) => {
  try {
    const logData = {
      userId,
      action: action.toUpperCase(),
      entityType: entityType.toUpperCase(),
      entityId,
      ipAddress: ipAddress || 'system',
      userAgent: userAgent || 'system',
      status: status.toUpperCase(),
      metadata
    };

    return await ActivityLog.create(logData);
  } catch (error) {
    console.error('Error logging custom activity:', error);
    throw new Error('Failed to log activity');
  }
};

/**
 * Get activity logs with pagination and filtering
 * @param {Object} options - Query options
 * @param {string} [options.userId] - Filter by user ID
 * @param {string} [options.action] - Filter by action type
 * @param {string} [options.entityType] - Filter by entity type
 * @param {Date} [options.startDate] - Start date for filtering
 * @param {Date} [options.endDate] - End date for filtering
 * @param {number} [options.page=1] - Page number
 * @param {number} [options.limit=10] - Number of items per page
 * @returns {Promise<Object>} Paginated activity logs
 */
const getActivityLogs = async ({
  userId,
  action,
  entityType,
  startDate,
  endDate,
  page = 1,
  limit = 10
} = {}) => {
  try {
    const query = {};
    
    if (userId) query.userId = userId;
    if (action) query.action = action.toUpperCase();
    if (entityType) query.entityType = entityType.toUpperCase();
    
    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    
    const [logs, total] = await Promise.all([
      ActivityLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ActivityLog.countDocuments(query)
    ]);

    return {
      logs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    throw new Error('Failed to fetch activity logs');
  }
};

export { logActivity, getActivityLogs };
