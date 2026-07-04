const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { handleValidation } = require('../middleware/validate');
const { authenticate, requireAdmin, requireStudent } = require('../middleware/auth');
const { getAttendance, getMyAttendance, adminSetAttendance } = require('../controllers/attendanceController');

router.get('/my', authenticate, requireStudent, getMyAttendance);
router.get('/', authenticate, requireAdmin, getAttendance);
router.post('/', authenticate, requireAdmin, [body('studentId').notEmpty(), body('date').notEmpty(), body('status').isIn(['present', 'absent', 'late'])], handleValidation, adminSetAttendance);

module.exports = router;