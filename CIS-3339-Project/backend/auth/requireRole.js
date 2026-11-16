const HttpError = require('../utils/HttpError');

module.exports = function requireRole(role) {
  return function (req, res, next) {
    if (!req.user || req.user.role !== role) {
      return next(new HttpError(403, 'Forbidden: Insufficient permissions'));
    }
    next();
  };
};