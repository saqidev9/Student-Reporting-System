const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { handleValidation } = require('../middleware/validate');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { getSettings, updateDeadline } = require('../controllers/settingsController');

router.get('/', authenticate, getSettings);
router.put('/deadline', authenticate, requireAdmin, [body('submissionDeadline').notEmpty()], handleValidation, updateDeadline);

module.exports = router;