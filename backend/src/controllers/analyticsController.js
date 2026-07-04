const { readJSON } = require('../utils/storage');
const { success, notFound } = require('../utils/response');

function buildSummary(reports, attendance, fromDate, toDate) {
  const inRange = reports.filter(r =>
    r.reportDate >= fromDate && r.reportDate <= toDate && r.status !== 'draft'
  );
  const attInRange = attendance.filter(a => a.date >= fromDate && a.date <= toDate);

  const submitted = inRange.length;
  const onTime = inRange.filter(r => !r.isLate).length;
  const late = inRange.filter(r => r.isLate).length;
  const approved = inRange.filter(r => r.status === 'approved').length;
  const rejected = inRange.filter(r => r.status === 'rejected').length;
  const needsRevision = inRange.filter(r => r.status === 'needs_revision').length;
  const pending = inRange.filter(r => r.status === 'pending').length;

  const scores = inRange
    .filter(r => r.evaluation?.score)
    .map(r => r.evaluation.score);
  const avgScore = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2) : null;

  const ratings = inRange
    .filter(r => r.evaluation?.starRating)
    .map(r => r.evaluation.starRating);
  const avgRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2) : null;

  const productivityValues = { low: 1, average: 2, good: 3, excellent: 4 };
  const productivityList = inRange
    .filter(r => r.evaluation?.productivity)
    .map(r => productivityValues[r.evaluation.productivity] || 0);
  const avgProductivityScore = productivityList.length
    ? productivityList.reduce((a, b) => a + b, 0) / productivityList.length
    : null;
  const avgProductivityLabel = avgProductivityScore
    ? Object.keys(productivityValues).find(k => productivityValues[k] === Math.round(avgProductivityScore)) || 'average'
    : null;

  const presentCount = attInRange.filter(a => a.status === 'present').length;
  const absentCount = attInRange.filter(a => a.status === 'absent').length;
  const lateAttCount = attInRange.filter(a => a.status === 'late').length;

  const daysInRange = getDayCount(fromDate, toDate);
  const completionRate = daysInRange > 0 ? ((submitted / daysInRange) * 100).toFixed(1) : '0.0';

  const feedback = inRange
    .filter(r => r.evaluation?.feedback)
    .map(r => ({ reportId: r.id, reportDate: r.reportDate, feedback: r.evaluation.feedback }));

  return {
    period: { from: fromDate, to: toDate },
    reports: { submitted, onTime, late, approved, rejected, needsRevision, pending },
    completionRate: `${completionRate}%`,
    scores: { average: avgScore, count: scores.length },
    ratings: { average: avgRating, count: ratings.length },
    productivity: { average: avgProductivityLabel },
    attendance: { present: presentCount, absent: absentCount, late: lateAttCount },
    feedback
  };
}

function getDayCount(fromDate, toDate) {
  const start = new Date(fromDate);
  const end = new Date(toDate);
  return Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
}

function getWeekBounds(weekOffset = 0) {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) - weekOffset * 7);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    from: monday.toISOString().split('T')[0],
    to: sunday.toISOString().split('T')[0]
  };
}

function getMonthBounds(monthOffset = 0) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() - monthOffset;
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  return {
    from: start.toISOString().split('T')[0],
    to: end.toISOString().split('T')[0]
  };
}

// ---- Student: own weekly summary ----

function myWeeklySummary(req, res) {
  const weekOffset = Number(req.query.weekOffset || 0);
  const { from, to } = getWeekBounds(weekOffset);
  const reports = readJSON('reports').filter(r => r.studentId === req.user.id);
  const attendance = readJSON('attendance').filter(a => a.studentId === req.user.id);
  const summary = buildSummary(reports, attendance, from, to);
  return success(res, { summary });
}

// ---- Student: own monthly summary ----

function myMonthlySummary(req, res) {
  const monthOffset = Number(req.query.monthOffset || 0);
  const { from, to } = getMonthBounds(monthOffset);
  const reports = readJSON('reports').filter(r => r.studentId === req.user.id);
  const attendance = readJSON('attendance').filter(a => a.studentId === req.user.id);

  const weeks = [];
  let cursor = new Date(from);
  while (cursor.toISOString().split('T')[0] <= to) {
    const weekFrom = cursor.toISOString().split('T')[0];
    const weekEnd = new Date(cursor);
    weekEnd.setDate(cursor.getDate() + 6);
    const weekTo = weekEnd.toISOString().split('T')[0] > to ? to : weekEnd.toISOString().split('T')[0];
    weeks.push(buildSummary(reports, attendance, weekFrom, weekTo));
    cursor.setDate(cursor.getDate() + 7);
  }

  const monthlySummary = buildSummary(reports, attendance, from, to);
  return success(res, { summary: monthlySummary, weeklyBreakdown: weeks });
}

// ---- Admin: student weekly summary ----

function studentWeeklySummary(req, res) {
  const { studentId } = req.params;
  const weekOffset = Number(req.query.weekOffset || 0);
  const users = readJSON('users');
  if (!users.find(u => u.id === studentId && u.role === 'student')) {
    return notFound(res, 'Student not found');
  }
  const { from, to } = getWeekBounds(weekOffset);
  const reports = readJSON('reports').filter(r => r.studentId === studentId);
  const attendance = readJSON('attendance').filter(a => a.studentId === studentId);
  const summary = buildSummary(reports, attendance, from, to);
  return success(res, { studentId, summary });
}

// ---- Admin: student monthly summary ----

function studentMonthlySummary(req, res) {
  const { studentId } = req.params;
  const monthOffset = Number(req.query.monthOffset || 0);
  const users = readJSON('users');
  if (!users.find(u => u.id === studentId && u.role === 'student')) {
    return notFound(res, 'Student not found');
  }
  const { from, to } = getMonthBounds(monthOffset);
  const reports = readJSON('reports').filter(r => r.studentId === studentId);
  const attendance = readJSON('attendance').filter(a => a.studentId === studentId);

  const weeks = [];
  let cursor = new Date(from);
  while (cursor.toISOString().split('T')[0] <= to) {
    const weekFrom = cursor.toISOString().split('T')[0];
    const weekEnd = new Date(cursor);
    weekEnd.setDate(cursor.getDate() + 6);
    const weekTo = weekEnd.toISOString().split('T')[0] > to ? to : weekEnd.toISOString().split('T')[0];
    weeks.push(buildSummary(reports, attendance, weekFrom, weekTo));
    cursor.setDate(cursor.getDate() + 7);
  }

  const monthlySummary = buildSummary(reports, attendance, from, to);
  return success(res, { studentId, summary: monthlySummary, weeklyBreakdown: weeks });
}

// ---- Admin: all students overview ----

function allStudentsOverview(req, res) {
  const { batchId, courseId, groupId, sortBy = 'name', page = 1, limit = 20 } = req.query;
  let students = readJSON('users').filter(u => u.role === 'student' && u.isActive);

  if (batchId) students = students.filter(s => s.batchId === batchId);
  if (courseId) students = students.filter(s => s.courseId === courseId);
  if (groupId) students = students.filter(s => s.groupId === groupId);

  const { from: weekFrom, to: weekTo } = getWeekBounds();
  const { from: monthFrom, to: monthTo } = getMonthBounds();
  const allReports = readJSON('reports');
  const allAttendance = readJSON('attendance');

  const overview = students.map(s => {
    const { password, ...safe } = s;
    const sReports = allReports.filter(r => r.studentId === s.id);
    const sAttendance = allAttendance.filter(a => a.studentId === s.id);
    const weeklySummary = buildSummary(sReports, sAttendance, weekFrom, weekTo);
    const monthlySummary = buildSummary(sReports, sAttendance, monthFrom, monthTo);
    return {
      student: safe,
      currentWeek: {
        submitted: weeklySummary.reports.submitted,
        avgScore: weeklySummary.scores.average,
        avgRating: weeklySummary.ratings.average,
        completionRate: weeklySummary.completionRate
      },
      currentMonth: {
        submitted: monthlySummary.reports.submitted,
        avgScore: monthlySummary.scores.average,
        avgRating: monthlySummary.ratings.average,
        completionRate: monthlySummary.completionRate
      }
    };
  });

  if (sortBy === 'score') {
    overview.sort((a, b) => (Number(b.currentMonth.avgScore) || 0) - (Number(a.currentMonth.avgScore) || 0));
  } else if (sortBy === 'completion') {
    overview.sort((a, b) => parseFloat(b.currentMonth.completionRate) - parseFloat(a.currentMonth.completionRate));
  } else {
    overview.sort((a, b) => a.student.name.localeCompare(b.student.name));
  }

  const total = overview.length;
  const start = (Number(page) - 1) * Number(limit);
  const paginated = overview.slice(start, start + Number(limit));

  return success(res, { students: paginated, total, page: Number(page), limit: Number(limit) });
}

// ---- Admin: dashboard counts ----

function adminDashboard(req, res) {
  const reports = readJSON('reports');
  const users = readJSON('users');
  const { readSingleJSON } = require('../utils/storage');
  const settings = readSingleJSON('settings');

  const today = new Date().toISOString().split('T')[0];
  const activeStudents = users.filter(u => u.role === 'student' && u.isActive);
  const todayReports = reports.filter(r => r.reportDate === today && r.status !== 'draft');
  const submittedTodayIds = todayReports.map(r => r.studentId);
  const missingToday = activeStudents.filter(s => !submittedTodayIds.includes(s.id));

  return success(res, {
    pendingReports: reports.filter(r => r.status === 'pending').length,
    needsRevision: reports.filter(r => r.status === 'needs_revision').length,
    missingReportsToday: missingToday.map(s => ({ id: s.id, name: s.name, groupId: s.groupId })),
    totalActiveStudents: activeStudents.length,
    submissionDeadline: settings.submissionDeadline
  });
}

module.exports = {
  myWeeklySummary,
  myMonthlySummary,
  studentWeeklySummary,
  studentMonthlySummary,
  allStudentsOverview,
  adminDashboard
};
