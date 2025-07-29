import jwt from 'jsonwebtoken'; // Change require to import
import User from '../model/User.js'; // Change require to import

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract and verify token
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user from database
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(404).json({ message: 'User not found' });
      }

      next();
    } catch (error) {
      console.error('JWT verification failed:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next(); // User is admin, proceed to the next middleware or controller
  } else {
    res.status(403).json({ message: 'Access denied, admin only' });
  }
};

// Role-based access control middleware
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to perform this action'
      });
    }
    next();
  };
};

export { admin, protect, restrictTo };

