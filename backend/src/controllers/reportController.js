const { v4: uuidv4 } = require('uuid');
const { readJSON, writeJSON } = require('../utils/storage');
const { success, created, notFound, badRequest, forbidden } = require('../utils/response');
const {
  getTodayDateString,
  getDateString,
  isWithinLateWindow,
  isSubmissionOnTime,
  isFutureDate
} = require('../utils/dateUtils');
const { readSingleJSON } = require('../utils/storage');

const VALID_STATUSES = ['pending', 'needs_revision', 'approved', 'rejected'];

// ---- STUDENT: Submit or save draft ----

function upsertReport(req, res) {
  const { reportDate, whatStudied, timeSpent, whatLearned, challenges, progressNotes, isDraft } = req.body;
  const studentId = req.user.id;

  if (isFutureDate(reportDate)) {
    return badRequest(res, 'You cannot submit a report for a future date');
  }

  if (!isWithinLateWindow(reportDate)) {
    return badRequest(res, 'You can only submit reports for up to 3 days in the past');
  }

  if (!isDraft) {
    const required = { whatStudied, timeSpent, whatLearned, challenges, progressNotes };
    const missing = Object.entries(required).filter(([, v]) => !v || v.trim() === '').map(([k]) => k);
    if (missing.length > 0) {
      return badRequest(res, `The following fields are required to submit: ${missing.join(', ')}`);
    }
  }

  const reports = readJSON('reports');
  const today = getTodayDateString();
  const targetDate = getDateString(reportDate);
  const now = new Date().toISOString();

  const existingIndex = reports.findIndex(
    r => r.studentId === studentId && r.reportDate === targetDate
  );

  if (existingIndex !== -1) {
    const existing = reports[existingIndex];

    if (existing.status === 'approved' || existing.status === 'rejected') {
      return badRequest(res, `Cannot edit a report with status: ${existing.status}`);
    }

    if (!isDraft && existing.status === 'pending' && existing.reviewedAt) {
      return badRequest(res, 'This report has already been reviewed. You cannot edit it now.');
    }

    if (existing.status === 'needs_revision' && !isDraft) {
      reports[existingIndex] = {
        ...existing,
        whatStudied: whatStudied ?? existing.whatStudied,
        timeSpent: timeSpent ?? existing.timeSpent,
        whatLearned: whatLearned ?? existing.whatLearned,
        challenges: challenges ?? existing.challenges,
        progressNotes: progressNotes ?? existing.progressNotes,
        status: 'pending',
        isLate: !isSubmissionOnTime(targetDate, now),
        resubmittedAt: now,
        updatedAt: now
      };
      writeJSON('reports', reports);
      return success(res, { report: reports[existingIndex] }, 'Report resubmitted for review');
    }

    reports[existingIndex] = {
      ...existing,
      whatStudied: whatStudied ?? existing.whatStudied,
      timeSpent: timeSpent ?? existing.timeSpent,
      whatLearned: whatLearned ?? existing.whatLearned,
      challenges: challenges ?? existing.challenges,
      progressNotes: progressNotes ?? existing.progressNotes,
      status: isDraft ? 'draft' : 'pending',
      isLate: !isDraft ? !isSubmissionOnTime(targetDate, now) : existing.isLate,
      submittedAt: isDraft ? existing.submittedAt : (existing.submittedAt || now),
      updatedAt: now
    };
    writeJSON('reports', reports);
    return success(res, { report: reports[existingIndex] }, isDraft ? 'Draft saved' : 'Report submitted');
  }

  const newReport = {
    id: `report-${uuidv4()}`,
    studentId,
    reportDate: targetDate,
    whatStudied: whatStudied || '',
    timeSpent: timeSpent || '',
    whatLearned: whatLearned || '',
    challenges: challenges || '',
    progressNotes: progressNotes || '',
    status: isDraft ? 'draft' : 'pending',
    isLate: !isDraft ? !isSubmissionOnTime(targetDate, now) : false,
    submittedAt: isDraft ? null : now,
    reviewedAt: null,
    resubmittedAt: null,
    evaluation: null,
    revisionHistory: [],
    createdAt: now,
    updatedAt: now
  };

  reports.push(newReport);
  writeJSON('reports', reports);

  if (!isDraft) {
    updateAttendanceOnSubmission(studentId, targetDate, newReport.isLate);
  }

  return created(res, { report: newReport }, isDraft ? 'Draft saved' : 'Report submitted successfully');
}

function updateAttendanceOnSubmission(studentId, reportDate, isLate) {
  const attendance = readJSON('attendance');
  const existing = attendance.find(a => a.studentId === studentId && a.date === reportDate);
  if (!existing) {
    attendance.push({
      id: `att-${uuidv4()}`,
      studentId,
      date: reportDate,
      status: isLate ? 'late' : 'present',
      isManual: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    writeJSON('attendance', attendance);
  }
}

// ---- STUDENT: Get own reports ----

function getMyReports(req, res) {
  const { status, fromDate, toDate, page = 1, limit = 20 } = req.query;
  let reports = readJSON('reports').filter(r => r.studentId === req.user.id && r.status !== 'draft' || (r.studentId === req.user.id && r.status === 'draft'));

  if (status) reports = reports.filter(r => r.status === status);
  if (fromDate) reports = reports.filter(r => r.reportDate >= fromDate);
  if (toDate) reports = reports.filter(r => r.reportDate <= toDate);

  reports.sort((a, b) => b.reportDate.localeCompare(a.reportDate));

  const total = reports.length;
  const start = (Number(page) - 1) * Number(limit);
  const paginated = reports.slice(start, start + Number(limit));

  return success(res, { reports: paginated, total, page: Number(page), limit: Number(limit) });
}

function getMyReport(req, res) {
  const reports = readJSON('reports');
  const report = reports.find(r => r.id === req.params.reportId && r.studentId === req.user.id);
  if (!report) return notFound(res, 'Report not found');
  return success(res, { report });
}

// ---- ADMIN: Get all reports ----

function adminListReports(req, res) {
  const {
    studentId, batchId, courseId, groupId,
    status, fromDate, toDate, isLate,
    minScore, maxScore, page = 1, limit = 20
  } = req.query;

  let reports = readJSON('reports').filter(r => r.status !== 'draft');
  const users = readJSON('users');

  if (studentId) reports = reports.filter(r => r.studentId === studentId);
  if (status) reports = reports.filter(r => r.status === status);
  if (fromDate) reports = reports.filter(r => r.reportDate >= fromDate);
  if (toDate) reports = reports.filter(r => r.reportDate <= toDate);
  if (isLate !== undefined) reports = reports.filter(r => r.isLate === (isLate === 'true'));
  if (minScore) reports = reports.filter(r => r.evaluation?.score >= Number(minScore));
  if (maxScore) reports = reports.filter(r => r.evaluation?.score <= Number(maxScore));

  if (batchId || courseId || groupId) {
    const studentIds = users
      .filter(u => u.role === 'student' &&
        (!batchId || u.batchId === batchId) &&
        (!courseId || u.courseId === courseId) &&
        (!groupId || u.groupId === groupId)
      )
      .map(u => u.id);
    reports = reports.filter(r => studentIds.includes(r.studentId));
  }

  reports.sort((a, b) => b.reportDate.localeCompare(a.reportDate));

  const enriched = reports.map(r => {
    const student = users.find(u => u.id === r.studentId);
    return {
      ...r,
      student: student ? { id: student.id, name: student.name, batchId: student.batchId, courseId: student.courseId, groupId: student.groupId } : null
    };
  });

  const total = enriched.length;
  const start = (Number(page) - 1) * Number(limit);
  const paginated = enriched.slice(start, start + Number(limit));

  return success(res, { reports: paginated, total, page: Number(page), limit: Number(limit) });
}

function adminGetReport(req, res) {
  const reports = readJSON('reports');
  const report = reports.find(r => r.id === req.params.reportId);
  if (!report) return notFound(res, 'Report not found');

  const users = readJSON('users');
  const student = users.find(u => u.id === report.studentId);
  return success(res, { report, student: student ? { id: student.id, name: student.name } : null });
}

function adminEvaluateReport(req, res) {
  const { reportId } = req.params;
  const { status, feedback, starRating, score, attendance, productivity } = req.body;
  const reports = readJSON('reports');
  const index = reports.findIndex(r => r.id === reportId);

  if (index === -1) return notFound(res, 'Report not found');
  if (reports[index].status === 'draft') return badRequest(res, 'Cannot evaluate a draft report');

  if (status && !VALID_STATUSES.includes(status)) {
    return badRequest(res, `Status must be one of: ${VALID_STATUSES.join(', ')}`);
  }
  if (starRating && (starRating < 1 || starRating > 5)) {
    return badRequest(res, 'Star rating must be between 1 and 5');
  }
  if (score && (score < 1 || score > 5)) {
    return badRequest(res, 'Score must be between 1 and 5');
  }
  if (productivity && !['low', 'average', 'good', 'excellent'].includes(productivity)) {
    return badRequest(res, 'Productivity must be: low, average, good, or excellent');
  }
  if (attendance && !['present', 'absent', 'late'].includes(attendance)) {
    return badRequest(res, 'Attendance must be: present, absent, or late');
  }

  const prevStatus = reports[index].status;
  const now = new Date().toISOString();

  if (prevStatus !== status && status) {
    reports[index].revisionHistory.push({
      fromStatus: prevStatus,
      toStatus: status,
      changedAt: now,
      changedBy: req.user.id
    });
  }

  reports[index].status = status || reports[index].status;
  reports[index].reviewedAt = now;
  reports[index].updatedAt = now;
  reports[index].evaluation = {
    ...(reports[index].evaluation || {}),
    feedback: feedback ?? reports[index].evaluation?.feedback,
    starRating: starRating ?? reports[index].evaluation?.starRating,
    score: score ?? reports[index].evaluation?.score,
    productivity: productivity ?? reports[index].evaluation?.productivity,
    evaluatedBy: req.user.id,
    evaluatedAt: now
  };

  writeJSON('reports', reports);

  if (attendance) {
    const report = reports[index];
    const attendanceList = readJSON('attendance');
    const attIndex = attendanceList.findIndex(
      a => a.studentId === report.studentId && a.date === report.reportDate
    );
    if (attIndex !== -1) {
      attendanceList[attIndex].status = attendance;
      attendanceList[attIndex].isManual = true;
      attendanceList[attIndex].updatedAt = now;
    } else {
      attendanceList.push({
        id: `att-${uuidv4()}`,
        studentId: report.studentId,
        date: report.reportDate,
        status: attendance,
        isManual: true,
        createdAt: now,
        updatedAt: now
      });
    }
    writeJSON('attendance', attendanceList);
  }

  return success(res, { report: reports[index] }, 'Report evaluated successfully');
}

module.exports = {
  upsertReport,
  getMyReports,
  getMyReport,
  adminListReports,
  adminGetReport,
  adminEvaluateReport
};
