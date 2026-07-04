const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { handleValidation } = require('../middleware/validate');
const { authenticate, requireAdmin, requireStudent } = require('../middleware/auth');
const { upsertReport, getMyReports, getMyReport, adminListReports, adminGetReport, adminEvaluateReport } = require('../controllers/reportController');

router.post('/', authenticate, requireStudent, [body('reportDate').notEmpty()], handleValidation, upsertReport);
router.get('/my', authenticate, requireStudent, getMyReports);
router.get('/my/:reportId', authenticate, requireStudent, getMyReport);
router.get('/', authenticate, requireAdmin, adminListReports);
router.get('/:reportId', authenticate, requireAdmin, adminGetReport);
router.put('/:reportId/evaluate', authenticate, requireAdmin, adminEvaluateReport);

module.exports = router;