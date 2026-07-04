const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { handleValidation } = require("../middleware/validate");
const { authenticate, requireAdmin } = require("../middleware/auth");
const {
  listTags,
  createTag,
  renameTag,
  deleteTag,
  assignTag,
  removeTagFromStudent,
  getStudentTags,
} = require("../controllers/tagController");

router.use(authenticate, requireAdmin);
router.get("/", listTags);
router.post("/", [body("name").notEmpty()], handleValidation, createTag);
router.put("/:tagId", [body("name").notEmpty()], handleValidation, renameTag);
router.delete("/:tagId", deleteTag);
router.post(
  "/assign",
  [body("studentId").notEmpty(), body("tagId").notEmpty()],
  handleValidation,
  assignTag,
);
router.delete("/assign/:studentId/:tagId", removeTagFromStudent);
router.get("/student/:studentId", getStudentTags);

module.exports = router;
