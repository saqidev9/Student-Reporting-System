function success(res, data = {}, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({ success: true, message, data });
}
function created(res, data = {}, message = 'Created successfully') {
  return res.status(201).json({ success: true, message, data });
}
function error(res, message = 'Something went wrong', statusCode = 500, errors = null) {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
}
function notFound(res, message = 'Resource not found') {
  return res.status(404).json({ success: false, message });
}
function forbidden(res, message = 'Access denied') {
  return res.status(403).json({ success: false, message });
}
function unauthorized(res, message = 'Unauthorized') {
  return res.status(401).json({ success: false, message });
}
function badRequest(res, message = 'Bad request', errors = null) {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(400).json(body);
}
module.exports = { success, created, error, notFound, forbidden, unauthorized, badRequest };