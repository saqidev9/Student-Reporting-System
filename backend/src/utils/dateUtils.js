const { readSingleJSON } = require('./storage');

function getTodayDateString() {
  return new Date().toISOString().split('T')[0];
}

function getDateString(date) {
  return new Date(date).toISOString().split('T')[0];
}

function isWithinLateWindow(reportDate) {
  const settings = readSingleJSON('settings');
  const maxDays = settings.maxLateSubmissionDays || 3;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(reportDate);
  target.setHours(0, 0, 0, 0);
  const diffMs = today - target;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= maxDays;
}

function isPastDeadlineForToday() {
  const settings = readSingleJSON('settings');
  const deadline = settings.submissionDeadline || '23:00';
  const [hours, minutes] = deadline.split(':').map(Number);
  const now = new Date();
  const deadlineTime = new Date();
  deadlineTime.setHours(hours, minutes, 0, 0);
  return now > deadlineTime;
}

function isSubmissionOnTime(reportDate, submittedAt) {
  const settings = readSingleJSON('settings');
  const deadline = settings.submissionDeadline || '23:00';
  const [hours, minutes] = deadline.split(':').map(Number);

  const reportDay = getDateString(reportDate);
  const submittedDay = getDateString(submittedAt);

  if (reportDay !== submittedDay) return false;

  const submitted = new Date(submittedAt);
  const deadlineTime = new Date(submittedAt);
  deadlineTime.setHours(hours, minutes, 0, 0);

  return submitted <= deadlineTime;
}

function isFutureDate(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return target > today;
}

module.exports = {
  getTodayDateString,
  getDateString,
  isWithinLateWindow,
  isPastDeadlineForToday,
  isSubmissionOnTime,
  isFutureDate
};
