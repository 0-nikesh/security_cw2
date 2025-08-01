import session from 'express-session';
import connectMongo from 'connect-mongo';
import mongoose from 'mongoose';

export default function setupSession(app) {
  // Create MongoDB session store
  const MongoStore = connectMongo(session);

  // Session configuration
  const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'your-secret-key', // Should be in .env
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create session until something is stored
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
      ttl: 24 * 60 * 60, // 1 day in seconds
      autoRemove: 'native' // Remove expired sessions automatically
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
      httpOnly: true, // Prevent client-side JS from reading the cookie
      sameSite: 'strict', // CSRF protection
      maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
      domain: process.env.COOKIE_DOMAIN || 'localhost'
    },
    name: 'sessionId', // Don't use default session cookie name
    rolling: true, // Reset maxAge on every request
    unset: 'destroy' // Delete the session when unset
  };

  // Trust first proxy (if behind a reverse proxy like Nginx)
  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }

  // Initialize session middleware
  app.use(session(sessionConfig));

  // Add security headers middleware
  app.use((req, res, next) => {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Enable XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Content Security Policy
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self';"
    );
    
    // Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Feature Policy
    res.setHeader(
      'Feature-Policy',
      "geolocation 'none'; microphone 'none'; camera 'none'"
    );
    
    next();
  });

  // Session timeout middleware
  app.use((req, res, next) => {
    if (req.session && req.session.lastRequest) {
      const sessionTimeout = 30 * 60 * 1000; // 30 minutes
      const timeSinceLastRequest = Date.now() - req.session.lastRequest;
      
      if (timeSinceLastRequest > sessionTimeout) {
        // Session has expired
        req.session.destroy((err) => {
          if (err) {
            console.error('Error destroying expired session:', err);
          }
          return res.status(401).json({
            status: 'error',
            message: 'Session expired. Please log in again.'
          });
        });
        return;
      }
    }
    
    // Update last request time
    if (req.session) {
      req.session.lastRequest = Date.now();
    }
    
    next();
  });
}
