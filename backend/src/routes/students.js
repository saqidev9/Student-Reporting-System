const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { handleValidation } = require("../middleware/validate");
const { authenticate, requireAdmin } = require("../middleware/auth");
const {
  listStudents,
  getStudent,
  createStudent,
  updateStudent,
  toggleStudentStatus,
  deleteStudent,
} = require("../controllers/studentController");

router.use(authenticate, requireAdmin);
router.get("/", listStudents);
router.get("/:studentId", getStudent);
router.post(
  "/",
  [
    body("name").notEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
    body("batchId").notEmpty(),
    body("courseId").notEmpty(),
    body("groupId").notEmpty(),
  ],
  handleValidation,
  createStudent,
);
router.put("/:studentId", updateStudent);
router.patch("/:studentId/toggle-status", toggleStudentStatus);
router.delete("/:studentId", deleteStudent);
module.exports = router;
