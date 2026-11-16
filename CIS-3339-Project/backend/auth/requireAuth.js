// Authroization middleware. It is used to check if API calls have a valid authorization token. This is to protect API endpoints against unauthorized calls.

const jwt = require('jsonwebtoken');
const HttpError = require('../utils/HttpError');

module.exports = function requireAuth(req, res, next) {
  const [scheme, token] = (req.header('Authorization') || '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next(new HttpError(401, 'Authentication required'));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.orgId) {
      return next(new HttpError(401, 'Invalid or expired token'));
    }
    req.user = decoded;
    next();
  } catch {
    next(new HttpError(401, 'Invalid or expired token'));
  }
};