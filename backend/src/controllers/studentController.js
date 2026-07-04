const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const { readJSON, writeJSON } = require("../utils/storage");
const { success, created, notFound, badRequest } = require("../utils/response");

function listStudents(req, res) {
  const {
    name,
    batchId,
    courseId,
    groupId,
    tag,
    isActive,
    page = 1,
    limit = 20,
  } = req.query;

  let students = readJSON("users").filter((u) => u.role === "student");
  const studentTags = readJSON("student_tags");
  const tags = readJSON("tags");

  if (name) {
    students = students.filter((s) =>
      s.name.toLowerCase().includes(name.toLowerCase()),
    );
  }
  if (batchId) students = students.filter((s) => s.batchId === batchId);
  if (courseId) students = students.filter((s) => s.courseId === courseId);
  if (groupId) students = students.filter((s) => s.groupId === groupId);
  if (isActive !== undefined) {
    students = students.filter((s) => s.isActive === (isActive === "true"));
  }

  if (tag) {
    const matchingTag = tags.find(
      (t) => t.name.toLowerCase() === tag.toLowerCase(),
    );
    if (matchingTag) {
      const taggedStudentIds = studentTags
        .filter((st) => st.tagId === matchingTag.id)
        .map((st) => st.studentId);
      students = students.filter((s) => taggedStudentIds.includes(s.id));
    } else {
      students = [];
    }
  }

  const total = students.length;
  const start = (Number(page) - 1) * Number(limit);
  const paginated = students.slice(start, start + Number(limit));

  const enriched = paginated.map((s) => {
    const { password, ...safe } = s;
    const assignedTags = studentTags
      .filter((st) => st.studentId === s.id)
      .map((st) => tags.find((t) => t.id === st.tagId))
      .filter(Boolean);
    return { ...safe, tags: assignedTags };
  });

  return success(res, {
    students: enriched,
    total,
    page: Number(page),
    limit: Number(limit),
  });
}

function getStudent(req, res) {
  const { studentId } = req.params;
  const users = readJSON("users");
  const student = users.find((u) => u.id === studentId && u.role === "student");
  if (!student) return notFound(res, "Student not found");

  const studentTags = readJSON("student_tags");
  const tags = readJSON("tags");
  const assignedTags = studentTags
    .filter((st) => st.studentId === studentId)
    .map((st) => tags.find((t) => t.id === st.tagId))
    .filter(Boolean);

  const { password, ...safe } = student;
  return success(res, { student: { ...safe, tags: assignedTags } });
}

async function createStudent(req, res) {
  const { name, email, password, batchId, courseId, groupId } = req.body;
  const users = readJSON("users");

  if (users.find((u) => u.email === email)) {
    return badRequest(res, "Email already in use");
  }

  const batches = readJSON("batches");
  const courses = readJSON("courses");
  const groups = readJSON("groups");
  const batchCourses = readJSON("batch_courses");

  if (!batches.find((b) => b.id === batchId))
    return badRequest(res, "Batch not found");
  if (!courses.find((c) => c.id === courseId))
    return badRequest(res, "Course not found");
  if (
    !batchCourses.find(
      (bc) => bc.batchId === batchId && bc.courseId === courseId,
    )
  ) {
    return badRequest(res, "This course does not belong to the selected batch");
  }
  const group = groups.find((g) => g.id === groupId);
  if (!group) return badRequest(res, "Group not found");
  if (group.batchId !== batchId || group.courseId !== courseId) {
    return badRequest(
      res,
      "Group does not belong to the selected batch and course",
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newStudent = {
    id: `student-${uuidv4()}`,
    name,
    email,
    password: hashedPassword,
    role: "student",
    isActive: true,
    batchId,
    courseId,
    groupId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  users.push(newStudent);
  writeJSON("users", users);

  const { password: _pw, ...safe } = newStudent;
  return created(res, { student: safe }, "Student created successfully");
}

function updateStudent(req, res) {
  const { studentId } = req.params;
  const { name, batchId, courseId, groupId } = req.body;
  const users = readJSON("users");
  const index = users.findIndex(
    (u) => u.id === studentId && u.role === "student",
  );
  if (index === -1) return notFound(res, "Student not found");

  if (batchId || courseId || groupId) {
    const targetBatch = batchId || users[index].batchId;
    const targetCourse = courseId || users[index].courseId;
    const targetGroup = groupId || users[index].groupId;

    const batchCourses = readJSON("batch_courses");
    const groups = readJSON("groups");

    if (
      !batchCourses.find(
        (bc) => bc.batchId === targetBatch && bc.courseId === targetCourse,
      )
    ) {
      return badRequest(res, "Course does not belong to the selected batch");
    }
    const group = groups.find((g) => g.id === targetGroup);
    if (
      !group ||
      group.batchId !== targetBatch ||
      group.courseId !== targetCourse
    ) {
      return badRequest(
        res,
        "Group does not match the selected batch and course",
      );
    }

    if (batchId) users[index].batchId = batchId;
    if (courseId) users[index].courseId = courseId;
    if (groupId) users[index].groupId = groupId;
  }

  if (name) users[index].name = name;
  users[index].updatedAt = new Date().toISOString();
  writeJSON("users", users);

  const { password, ...safe } = users[index];
  return success(res, { student: safe }, "Student updated successfully");
}

function toggleStudentStatus(req, res) {
  const { studentId } = req.params;
  const users = readJSON("users");
  const index = users.findIndex(
    (u) => u.id === studentId && u.role === "student",
  );
  if (index === -1) return notFound(res, "Student not found");

  users[index].isActive = !users[index].isActive;
  users[index].updatedAt = new Date().toISOString();
  writeJSON("users", users);

  const { password, ...safe } = users[index];
  const status = safe.isActive ? "activated" : "deactivated";
  return success(res, { student: safe }, `Student ${status} successfully`);
}
function deleteStudent(req, res) {
  const { studentId } = req.params;

  const users = readJSON("users");

  const index = users.findIndex(
    (u) => u.id === studentId && u.role === "student",
  );

  if (index === -1) {
    return notFound(res, "Student not found");
  }

  // remove student
  users.splice(index, 1);

  writeJSON("users", users);

  return success(res, {}, "Student deleted successfully");
}

module.exports = {
  listStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  toggleStudentStatus,
};
