module.exports = function withOrg(req, query = {}) {
  return {
    ...query,
    org: req.user.orgId
  };
};