/**
 * Centralized Error Handling Middleware
 * Ensures every error produces a structured, standardized JSON payload with error codes and request IDs.
 */

class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

function notFoundHandler(req, res, next) {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      error: 'Endpoint not found. Did you typo the URL like you typo your code?',
      code: 'NOT_FOUND',
      path: req.originalUrl,
      requestId: req.id || null,
      timestamp: new Date().toISOString(),
    });
  }
  next();
}

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const requestId = req.id || null;
  const isProd = process.env.NODE_ENV === 'production';

  // Log error with request ID for correlation
  console.error(`[ErrorHandler] [${requestId || 'N/A'}] ${err.name || 'Error'}: ${err.message}`);
  if (statusCode >= 500 && !isProd) {
    console.error(err.stack);
  }

  // Standardized response structure
  return res.status(statusCode).json({
    success: false,
    error: err.message || 'An unexpected internal server error occurred. Even our error handlers are disappointed.',
    code: err.code || 'SERVER_ERROR',
    requestId,
    timestamp: new Date().toISOString(),
    ...(err.details ? { details: err.details } : {}),
    ...(!isProd && statusCode >= 500 ? { stack: err.stack } : {}),
  });
}

module.exports = {
  AppError,
  notFoundHandler,
  errorHandler,
};
