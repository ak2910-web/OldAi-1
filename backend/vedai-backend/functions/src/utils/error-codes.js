/**
 * Standardized Error Codes and Error Class
 * Provides consistent error handling across all API endpoints
 */

/**
 * Application error codes with HTTP status mappings
 */
const ErrorCodes = {
  // Client errors (4xx)
  INVALID_INPUT: { code: 'INVALID_INPUT', status: 400, message: 'Invalid input provided' },
  INVALID_QUESTION: { code: 'INVALID_QUESTION', status: 400, message: 'Question is required and must be valid' },
  INVALID_LANGUAGE: { code: 'INVALID_LANGUAGE', status: 400, message: 'Invalid language specified' },
  INVALID_USER_ID: { code: 'INVALID_USER_ID', status: 400, message: 'Invalid user ID provided' },
  INVALID_IMAGE: { code: 'INVALID_IMAGE', status: 400, message: 'Invalid image data provided' },
  
  // Rate limiting (429)
  RATE_LIMIT_EXCEEDED: { code: 'RATE_LIMIT_EXCEEDED', status: 429, message: 'Rate limit exceeded' },
  DAILY_LIMIT_EXCEEDED: { code: 'DAILY_LIMIT_EXCEEDED', status: 429, message: 'Daily query limit exceeded' },
  
  // Server errors (5xx)
  INTERNAL_ERROR: { code: 'INTERNAL_ERROR', status: 500, message: 'Internal server error' },
  AI_SERVICE_ERROR: { code: 'AI_SERVICE_ERROR', status: 502, message: 'AI service unavailable' },
  QUOTA_EXHAUSTED: { code: 'QUOTA_EXHAUSTED', status: 503, message: 'API quota exhausted, please try again later' },
  DATABASE_ERROR: { code: 'DATABASE_ERROR', status: 500, message: 'Database operation failed' },
  CACHE_ERROR: { code: 'CACHE_ERROR', status: 500, message: 'Cache operation failed' },
  
  // Not found (404)
  NOT_FOUND: { code: 'NOT_FOUND', status: 404, message: 'Resource not found' },
};

/**
 * Custom Application Error class
 * Extends Error with structured error information
 */
class AppError extends Error {
  /**
   * Create an application error
   * @param {Object} errorCode - Error code object from ErrorCodes
   * @param {string} message - Custom error message (optional, uses default if not provided)
   * @param {Object} details - Additional error details (optional)
   */
  constructor(errorCode, message = null, details = {}) {
    super(message || errorCode.message);
    this.name = 'AppError';
    this.errorCode = errorCode.code;
    this.statusCode = errorCode.status;
    this.details = details;
    
    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
  
  /**
   * Convert error to JSON response format
   */
  toJSON() {
    return {
      error: this.message,
      errorCode: this.errorCode,
      ...this.details
    };
  }
}

module.exports = {
  ErrorCodes,
  AppError,
};
