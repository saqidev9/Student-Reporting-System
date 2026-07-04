const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { readJSON, writeJSON } = require('../utils/storage');
const { success, badRequest, unauthorized } = require('../utils/response');

async function login(req, res) {
  const { email, password } = req.body;
  const users = readJSON('users');
  const user = users.find(u => u.email === email);

  if (!user || !user.isActive) {
    return unauthorized(res, 'Invalid email or password');
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return unauthorized(res, 'Invalid email or password');
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const { password: _pw, ...safeUser } = user;
  return success(res, { token, user: safeUser }, 'Login successful');
}

async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  const users = readJSON('users');
  const index = users.findIndex(u => u.id === req.user.id);

  if (index === -1) return badRequest(res, 'User not found');

  const match = await bcrypt.compare(currentPassword, users[index].password);
  if (!match) return badRequest(res, 'Current password is incorrect');

  users[index].password = await bcrypt.hash(newPassword, 10);
  users[index].updatedAt = new Date().toISOString();
  writeJSON('users', users);

  return success(res, {}, 'Password changed successfully');
}

async function adminResetPassword(req, res) {
  const { studentId } = req.params;
  const { newPassword } = req.body;
  const users = readJSON('users');
  const index = users.findIndex(u => u.id === studentId && u.role === 'student');

  if (index === -1) return badRequest(res, 'Student not found');

  users[index].password = await bcrypt.hash(newPassword, 10);
  users[index].updatedAt = new Date().toISOString();
  writeJSON('users', users);

  return success(res, {}, 'Password reset successfully');
}

function getMe(req, res) {
  return success(res, { user: req.user }, 'Profile fetched');
}

module.exports = { login, changePassword, adminResetPassword, getMe };
