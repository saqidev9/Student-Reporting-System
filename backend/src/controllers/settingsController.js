const { readSingleJSON, writeSingleJSON } = require('../utils/storage');
const { success, badRequest } = require('../utils/response');

function getSettings(req, res) {
  const settings = readSingleJSON('settings');
  return success(res, { settings });
}

function updateDeadline(req, res) {
  const { submissionDeadline } = req.body;
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(submissionDeadline)) {
    return badRequest(res, 'Deadline must be in HH:MM 24-hour format (e.g. 23:00)');
  }

  const settings = readSingleJSON('settings');
  settings.submissionDeadline = submissionDeadline;
  settings.submissionDeadlineUpdatedAt = new Date().toISOString();
  settings.submissionDeadlineUpdatedBy = req.user.id;
  writeSingleJSON('settings', settings);

  return success(res, { settings }, 'Submission deadline updated. New deadline takes effect tomorrow.');
}

module.exports = { getSettings, updateDeadline };
