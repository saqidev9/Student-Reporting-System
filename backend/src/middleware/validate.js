const { validationResult } = require('express-validator');
const { badRequest } = require('../utils/response');

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return badRequest(res, 'Validation failed', errors.array());
  }
  next();
}

module.exports = { handleValidation };