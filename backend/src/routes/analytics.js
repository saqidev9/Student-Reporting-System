const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin, requireStudent } = require('../middleware/auth');
const { myWeeklySummary, myMonthlySummary, studentWeeklySummary, studentMonthlySummary, allStudentsOverview, adminDashboard } = require('../controllers/analyticsController');

router.get('/my/weekly', authenticate, requireStudent, myWeeklySummary);
router.get('/my/monthly', authenticate, requireStudent, myMonthlySummary);
router.get('/dashboard', authenticate, requireAdmin, adminDashboard);
router.get('/students', authenticate, requireAdmin, allStudentsOverview);
router.get('/students/:studentId/weekly', authenticate, requireAdmin, studentWeeklySummary);
router.get('/students/:studentId/monthly', authenticate, requireAdmin, studentMonthlySummary);

module.exports = router;