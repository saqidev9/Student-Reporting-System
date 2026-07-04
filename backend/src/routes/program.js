const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { handleValidation } = require('../middleware/validate');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { listBatches, getBatch, createBatch, assignCourseToBatch, listCourses, createCourse, listGroups, createGroup } = require('../controllers/programController');

router.use(authenticate, requireAdmin);
router.get('/batches', listBatches);
router.get('/batches/:batchId', getBatch);
router.post('/batches', [body('name').notEmpty()], handleValidation, createBatch);
router.post('/batches/:batchId/courses', [body('courseId').notEmpty()], handleValidation, assignCourseToBatch);
router.get('/courses', listCourses);
router.post('/courses', [body('name').notEmpty(), body('domain').notEmpty()], handleValidation, createCourse);
router.get('/groups', listGroups);
router.post('/groups', [body('name').notEmpty(), body('batchId').notEmpty(), body('courseId').notEmpty()], handleValidation, createGroup);

module.exports = router;