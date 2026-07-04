const { v4: uuidv4 } = require('uuid');
const { readJSON, writeJSON } = require('../utils/storage');
const { success, created, notFound, badRequest } = require('../utils/response');

const VALID_STATUSES = ['present', 'absent', 'late'];

function getAttendance(req, res) {
  const { studentId, fromDate, toDate, month, year } = req.query;
  let attendance = readJSON('attendance');

  if (studentId) attendance = attendance.filter(a => a.studentId === studentId);

  if (month && year) {
    attendance = attendance.filter(a => {
      const d = new Date(a.date);
      return d.getMonth() + 1 === Number(month) && d.getFullYear() === Number(year);
    });
  } else {
    if (fromDate) attendance = attendance.filter(a => a.date >= fromDate);
    if (toDate) attendance = attendance.filter(a => a.date <= toDate);
  }

  return success(res, { attendance });
}

function getMyAttendance(req, res) {
  const { month, year, fromDate, toDate } = req.query;
  let attendance = readJSON('attendance').filter(a => a.studentId === req.user.id);

  if (month && year) {
    attendance = attendance.filter(a => {
      const d = new Date(a.date);
      return d.getMonth() + 1 === Number(month) && d.getFullYear() === Number(year);
    });
  } else {
    if (fromDate) attendance = attendance.filter(a => a.date >= fromDate);
    if (toDate) attendance = attendance.filter(a => a.date <= toDate);
  }

  return success(res, { attendance });
}

function adminSetAttendance(req, res) {
  const { studentId, date, status } = req.body;

  if (!VALID_STATUSES.includes(status)) {
    return badRequest(res, `Status must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  const users = readJSON('users');
  if (!users.find(u => u.id === studentId && u.role === 'student')) {
    return notFound(res, 'Student not found');
  }

  const attendance = readJSON('attendance');
  const now = new Date().toISOString();
  const existing = attendance.findIndex(a => a.studentId === studentId && a.date === date);

  if (existing !== -1) {
    attendance[existing].status = status;
    attendance[existing].isManual = true;
    attendance[existing].updatedAt = now;
    writeJSON('attendance', attendance);
    return success(res, { attendance: attendance[existing] }, 'Attendance updated');
  }

  const newEntry = {
    id: `att-${uuidv4()}`,
    studentId,
    date,
    status,
    isManual: true,
    createdAt: now,
    updatedAt: now
  };
  attendance.push(newEntry);
  writeJSON('attendance', attendance);
  return created(res, { attendance: newEntry }, 'Attendance recorded');
}

module.exports = { getAttendance, getMyAttendance, adminSetAttendance };
