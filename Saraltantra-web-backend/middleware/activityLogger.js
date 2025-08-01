import ActivityLog from '../model/ActivityLog.js';
import AppError from '../utils/appError.js';

// Helper function to determine entity type from URL
const getEntityTypeFromUrl = (url) => {
  if (url.includes('/api/users')) return 'USER';
  if (url.includes('/api/posts')) return 'POST';
  if (url.includes('/api/payments')) return 'PAYMENT';
  if (url.includes('/api/guidance')) return 'GUIDANCE';
  if (url.includes('/api/feedback')) return 'FEEDBACK';
  if (url.includes('/api/notifications')) return 'NOTIFICATION';
  return 'SYSTEM';
};

// Helper function to determine action from HTTP method
const getActionFromMethod = (method) => {
  switch (method.toUpperCase()) {
    case 'GET': return 'VIEW';
    case 'POST': return 'CREATE';
    case 'PUT':
    case 'PATCH': return 'UPDATE';
    case 'DELETE': return 'DELETE';
    default: return 'VIEW'; // Use VIEW for unknown methods
  }
};

// Main logging middleware
const activityLogger = async (req, res, next) => {
  // Skip logging for certain paths
  const skipPaths = ['/health', '/metrics', '/favicon.ico'];
  if (skipPaths.includes(req.path)) {
    return next();
  }

  // Capture response data
  const originalSend = res.send;
  const originalJson = res.json;
  
  // Store response data for logging
  res.send = function (body) {
    res.locals.responseBody = body;
    return originalSend.call(this, body);
  };
  
  res.json = function (body) {
    res.locals.responseBody = body;
    return originalJson.call(this, body);
  };

  // Log after response is sent
  res.on('finish', async () => {
    try {
      // Skip specific paths that don't need logging
      const skipLoggingPaths = ['/health', '/metrics', '/favicon.ico'];
      if (skipLoggingPaths.includes(req.path)) {
        return;
      }

      // Get IP address (handling proxy if needed)
      const ip = req.headers['x-forwarded-for'] || 
                req.connection.remoteAddress || 
                req.socket.remoteAddress ||
                (req.connection.socket ? req.connection.socket.remoteAddress : null);

      // Prepare log data
      const logData = {
        userId: req.user?._id || null,
        action: getActionFromMethod(req.method),
        entityType: getEntityTypeFromUrl(req.originalUrl),
        entityId: req.params?.id || null,
        ipAddress: ip,
        userAgent: req.headers['user-agent'] || '',
        status: res.statusCode < 400 ? 'SUCCESS' : 'FAILURE',
        metadata: {
          method: req.method,
          url: req.originalUrl,
          statusCode: res.statusCode,
          responseTime: res.get('X-Response-Time'),
          params: req.params,
          query: req.query,
          // Be careful with sensitive data in body
          requestBody: req.body && Object.keys(req.body).length > 0 ? req.body : undefined,
          responseBody: res.locals.responseBody,
          error: res.locals.error || undefined
        }
      };

      // Special handling for login/logout
      if (req.path === '/api/users/login') {
        logData.action = 'LOGIN';
        logData.status = res.statusCode === 200 ? 'SUCCESS' : 'FAILURE';
      } else if (req.path === '/api/users/logout') {
        logData.action = 'LOGOUT';
      }

      // Save to database
      await ActivityLog.create(logData);
    } catch (error) {
      // Don't let logging errors affect the main request
      console.error('Error logging activity:', error);
    }
  });

  next();
};

export default activityLogger;
