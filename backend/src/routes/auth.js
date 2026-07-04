const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { handleValidation } = require('../middleware/validate');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { login, changePassword, adminResetPassword, getMe } = require('../controllers/authController');

router.post('/login', [body('email').isEmail(), body('password').notEmpty()], handleValidation, login);
router.get('/me', authenticate, getMe);
router.put('/change-password', authenticate, [body('currentPassword').notEmpty(), body('newPassword').isLength({ min: 6 })], handleValidation, changePassword);
router.put('/reset-password/:studentId', authenticate, requireAdmin, [body('newPassword').isLength({ min: 6 })], handleValidation, adminResetPassword);

module.exports = router;