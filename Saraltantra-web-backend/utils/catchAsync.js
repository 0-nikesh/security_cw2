/**
 * A higher-order function that wraps async/await route handlers to catch errors
 * and pass them to Express's error handling middleware.
 * 
 * @param {Function} fn - The async route handler function
 * @returns {Function} - A new function that handles errors properly
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    // Execute the async function and catch any errors
    // The error will be passed to Express's error handling middleware
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
  };
};

export default catchAsync;
