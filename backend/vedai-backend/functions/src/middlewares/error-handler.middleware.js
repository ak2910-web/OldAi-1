/**
 * Global Error Handler Middleware
 * Catches and formats all errors consistently
 */

const { AppError } = require('../utils/error-codes');

/**
 * Express-style error handler
 * Should be registered as the last middleware
 * 
 * @param {Error} err - Error object
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
function errorHandler(err, req, res, next) {
  // Log error for debugging
  console.error('[ERROR-HANDLER]', {
    error: err.message,
    code: err.errorCode || 'UNKNOWN',
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.body?.userId || req.headers['x-user-id'],
  });
  
  // Handle AppError (expected errors)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(err.toJSON());
  }
  
  // Handle unexpected errors (don't expose internals to client)
  console.error('[UNEXPECTED-ERROR]', {
    name: err.name,
    message: err.message,
    stack: err.stack,
  });
  
  return res.status(500).json({
    error: 'Internal server error',
    errorCode: 'INTERNAL_ERROR',
  });
}

/**
 * Async wrapper to catch errors in async route handlers
 * Usage: app.get('/route', asyncHandler(async (req, res) => { ... }))
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  errorHandler,
  asyncHandler,
};
