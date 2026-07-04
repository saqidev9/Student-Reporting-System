const { v4: uuidv4 } = require('uuid');
const { readJSON, writeJSON } = require('../utils/storage');
const { success, created, notFound, badRequest } = require('../utils/response');

// ---- BATCHES ----

function listBatches(req, res) {
  const batches = readJSON('batches');
  const batchCourses = readJSON('batch_courses');
  const courses = readJSON('courses');

  const enriched = batches.map(b => {
    const batchCourseIds = batchCourses
      .filter(bc => bc.batchId === b.id)
      .map(bc => bc.courseId);
    const batchCourseList = courses.filter(c => batchCourseIds.includes(c.id));
    return { ...b, courses: batchCourseList };
  });

  return success(res, { batches: enriched });
}

function getBatch(req, res) {
  const batches = readJSON('batches');
  const batch = batches.find(b => b.id === req.params.batchId);
  if (!batch) return notFound(res, 'Batch not found');
  return success(res, { batch });
}

function createBatch(req, res) {
  const { name, description, carryCoursesFrom } = req.body;
  const batches = readJSON('batches');
  const batchCourses = readJSON('batch_courses');

  if (batches.find(b => b.name === name)) {
    return badRequest(res, 'A batch with this name already exists');
  }

  const newBatch = {
    id: `batch-${uuidv4()}`,
    name,
    description: description || '',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  batches.push(newBatch);
  writeJSON('batches', batches);

  if (carryCoursesFrom) {
    const sourceBatchCourses = batchCourses.filter(bc => bc.batchId === carryCoursesFrom);
    sourceBatchCourses.forEach(bc => {
      batchCourses.push({
        id: `bc-${uuidv4()}`,
        batchId: newBatch.id,
        courseId: bc.courseId,
        createdAt: new Date().toISOString()
      });
    });
    writeJSON('batch_courses', batchCourses);
  }

  return created(res, { batch: newBatch }, 'Batch created successfully');
}

function assignCourseToBatch(req, res) {
  const { batchId } = req.params;
  const { courseId } = req.body;
  const batches = readJSON('batches');
  const courses = readJSON('courses');
  const batchCourses = readJSON('batch_courses');

  if (!batches.find(b => b.id === batchId)) return notFound(res, 'Batch not found');
  if (!courses.find(c => c.id === courseId)) return notFound(res, 'Course not found');
  if (batchCourses.find(bc => bc.batchId === batchId && bc.courseId === courseId)) {
    return badRequest(res, 'Course already assigned to this batch');
  }

  const entry = {
    id: `bc-${uuidv4()}`,
    batchId,
    courseId,
    createdAt: new Date().toISOString()
  };
  batchCourses.push(entry);
  writeJSON('batch_courses', batchCourses);
  return created(res, { assignment: entry }, 'Course assigned to batch');
}

// ---- COURSES ----

function listCourses(req, res) {
  const courses = readJSON('courses');
  return success(res, { courses });
}

function createCourse(req, res) {
  const { name, description, domain } = req.body;
  const courses = readJSON('courses');

  if (courses.find(c => c.name === name)) {
    return badRequest(res, 'A course with this name already exists');
  }

  const validDomains = ['programming', 'designing', 'video_editing', 'professional_skills'];
  if (!validDomains.includes(domain)) {
    return badRequest(res, `Domain must be one of: ${validDomains.join(', ')}`);
  }

  const newCourse = {
    id: `course-${uuidv4()}`,
    name,
    description: description || '',
    domain,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  courses.push(newCourse);
  writeJSON('courses', courses);
  return created(res, { course: newCourse }, 'Course created successfully');
}

// ---- GROUPS ----

function listGroups(req, res) {
  const { batchId, courseId } = req.query;
  let groups = readJSON('groups');
  if (batchId) groups = groups.filter(g => g.batchId === batchId);
  if (courseId) groups = groups.filter(g => g.courseId === courseId);
  return success(res, { groups });
}

function createGroup(req, res) {
  const { name, batchId, courseId } = req.body;
  const batches = readJSON('batches');
  const batchCourses = readJSON('batch_courses');
  const groups = readJSON('groups');

  if (!batches.find(b => b.id === batchId)) return notFound(res, 'Batch not found');
  if (!batchCourses.find(bc => bc.batchId === batchId && bc.courseId === courseId)) {
    return badRequest(res, 'Course is not assigned to this batch');
  }
  if (groups.find(g => g.name === name && g.batchId === batchId && g.courseId === courseId)) {
    return badRequest(res, 'A group with this name already exists in this batch and course');
  }

  const newGroup = {
    id: `group-${uuidv4()}`,
    name,
    batchId,
    courseId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  groups.push(newGroup);
  writeJSON('groups', groups);
  return created(res, { group: newGroup }, 'Group created successfully');
}

module.exports = {
  listBatches, getBatch, createBatch, assignCourseToBatch,
  listCourses, createCourse,
  listGroups, createGroup
};
