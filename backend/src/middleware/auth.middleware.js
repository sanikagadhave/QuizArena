// src/middleware/auth.middleware.js
const { verifyToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');

// Verifies the JWT sent in the Authorization: Bearer <token> header
function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return next(new ApiError(401, 'Authentication required. No token provided.'));
  }

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.id, email: payload.email, role: payload.role, name: payload.name };
    next();
  } catch (err) {
    return next(new ApiError(401, 'Invalid or expired token.'));
  }
}

// Restricts a route to one or more roles, e.g. authorize('admin')
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return next(new ApiError(401, 'Authentication required.'));
    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to perform this action.'));
    }
    next();
  };
}

module.exports = { authenticate, authorize };
