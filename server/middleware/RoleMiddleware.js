const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required"
      });
    }

    if (!Array.isArray(req.user.roles)) {
      return res.status(403).json({
        message: "No valid roles assigned"
      });
    }

    const hasRole = req.user.roles.some(
      (role) => allowedRoles.includes(role)
    );

    if (!hasRole) {
      return res.status(403).json({
        message: "You are not authorized to access this resource"
      });
    }

    next();
  };
};

module.exports = {
  authorizeRoles
};