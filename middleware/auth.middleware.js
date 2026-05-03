const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: String(decoded.id || decoded._id),
    };

    next();
  } catch {
    return res.status(401).json({
      message: "Invalid token",
    });
  }
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    req.user = null;
    return next();
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: String(decoded.id || decoded._id),
    };

    next();
  } catch(err) {
    req.user = null;
    next();
  }
}

module.exports = {
  requireAuth,
  optionalAuth
};
