// src/middleware/error.middleware.js
const ApiError = require('../utils/ApiError');

function notFoundHandler(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// Central error handler - every controller/service throws ApiError (or lets
// an unexpected error bubble up) and this is the single place responses
// get formatted, so all services return the same JSON error shape.
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  if (statusCode === 500) {
    console.error('[UNHANDLED ERROR]', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    details: err.details || undefined,
  });
}

module.exports = { notFoundHandler, errorHandler };
