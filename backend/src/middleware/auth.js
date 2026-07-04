const jwt = require('jsonwebtoken');
const { readJSON } = require('../utils/storage');
const { unauthorized, forbidden } = require('../utils/response');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return unauthorized(res, 'No token provided');
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const users = readJSON('users');
    const user = users.find(u => u.id === decoded.id);
    if (!user || !user.isActive) {
      return unauthorized(res, 'User not found or deactivated');
    }
    const { password, ...safeUser } = user;
    req.user = safeUser;
    next();
  } catch (err) {
    return unauthorized(res, 'Invalid or expired token');
  }
}

function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return forbidden(res, 'Admin access required');
  }
  next();
}

function requireStudent(req, res, next) {
  if (req.user.role !== 'student') {
    return forbidden(res, 'Student access required');
  }
  next();
}

module.exports = { authenticate, requireAdmin, requireStudent };
