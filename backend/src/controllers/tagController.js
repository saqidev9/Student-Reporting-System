const { v4: uuidv4 } = require('uuid');
const { readJSON, writeJSON } = require('../utils/storage');
const { success, created, notFound, badRequest } = require('../utils/response');

function listTags(req, res) {
  const tags = readJSON('tags');
  return success(res, { tags });
}

function createTag(req, res) {
  const { name } = req.body;
  const tags = readJSON('tags');
  if (tags.find(t => t.name.toLowerCase() === name.toLowerCase())) {
    return badRequest(res, 'A tag with this name already exists');
  }
  const newTag = { id: `tag-${uuidv4()}`, name, createdAt: new Date().toISOString() };
  tags.push(newTag);
  writeJSON('tags', tags);
  return created(res, { tag: newTag }, 'Tag created');
}

function renameTag(req, res) {
  const { tagId } = req.params;
  const { name } = req.body;
  const tags = readJSON('tags');
  const index = tags.findIndex(t => t.id === tagId);
  if (index === -1) return notFound(res, 'Tag not found');
  if (tags.find(t => t.name.toLowerCase() === name.toLowerCase() && t.id !== tagId)) {
    return badRequest(res, 'A tag with this name already exists');
  }
  tags[index].name = name;
  writeJSON('tags', tags);
  return success(res, { tag: tags[index] }, 'Tag renamed');
}

function deleteTag(req, res) {
  const { tagId } = req.params;
  const tags = readJSON('tags');
  if (!tags.find(t => t.id === tagId)) return notFound(res, 'Tag not found');

  writeJSON('tags', tags.filter(t => t.id !== tagId));

  const studentTags = readJSON('student_tags');
  writeJSON('student_tags', studentTags.filter(st => st.tagId !== tagId));

  return success(res, {}, 'Tag deleted');
}

function assignTag(req, res) {
  const { studentId, tagId } = req.body;
  const users = readJSON('users');
  const tags = readJSON('tags');
  const studentTags = readJSON('student_tags');

  if (!users.find(u => u.id === studentId && u.role === 'student')) {
    return notFound(res, 'Student not found');
  }
  if (!tags.find(t => t.id === tagId)) return notFound(res, 'Tag not found');
  if (studentTags.find(st => st.studentId === studentId && st.tagId === tagId)) {
    return badRequest(res, 'Tag already assigned to this student');
  }

  const entry = {
    id: `st-${uuidv4()}`,
    studentId,
    tagId,
    assignedAt: new Date().toISOString(),
    assignedBy: req.user.id
  };
  studentTags.push(entry);
  writeJSON('student_tags', studentTags);
  return created(res, { assignment: entry }, 'Tag assigned to student');
}

function removeTagFromStudent(req, res) {
  const { studentId, tagId } = req.params;
  const studentTags = readJSON('student_tags');
  const index = studentTags.findIndex(st => st.studentId === studentId && st.tagId === tagId);
  if (index === -1) return notFound(res, 'Tag assignment not found');
  studentTags.splice(index, 1);
  writeJSON('student_tags', studentTags);
  return success(res, {}, 'Tag removed from student');
}

function getStudentTags(req, res) {
  const { studentId } = req.params;
  const studentTags = readJSON('student_tags').filter(st => st.studentId === studentId);
  const tags = readJSON('tags');
  const result = studentTags
    .map(st => tags.find(t => t.id === st.tagId))
    .filter(Boolean);
  return success(res, { tags: result });
}

module.exports = { listTags, createTag, renameTag, deleteTag, assignTag, removeTagFromStudent, getStudentTags };
