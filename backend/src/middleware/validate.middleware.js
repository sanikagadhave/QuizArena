// src/middleware/validate.middleware.js
const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

// Runs after express-validator check() chains; turns failures into a
// consistent 400 error response instead of letting each route handle it.
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ApiError(400, 'Validation failed', errors.array().map(e => ({
      field: e.path,
      message: e.msg,
    }))));
  }
  next();
}

module.exports = validate;
