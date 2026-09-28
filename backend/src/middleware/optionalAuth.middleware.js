// src/middleware/optionalAuth.middleware.js
// Attaches req.user if a valid token is present, but never blocks the
// request if it's missing/invalid. Used on public GET /quizzes so admins
// browsing can see unpublished quizzes too, while guests still get a list.
const { verifyToken } = require('../utils/jwt');

function optionalAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) {
    try {
      const payload = verifyToken(token);
      req.user = { id: payload.id, email: payload.email, role: payload.role, name: payload.name };
    } catch (_) { /* ignore invalid token on public route */ }
  }
  next();
}

module.exports = optionalAuth;
