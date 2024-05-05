const jwt = require("jsonwebtoken");
const authConfig = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;

const helpers = require("../helpers");
const ResponseHandler = helpers.response;

const verifyToken = async (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return ResponseHandler.unauthorized(res, "Unauthorized");
  }
  try {
    const decoded = jwt.verify(token, authConfig.SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return ResponseHandler.unauthorized(res, "Unauthorized");
    }
    req.user = user;
    next();
  } catch (error) {
    return ResponseHandler.unauthorized(res, "Unauthorized");
  }
};

const isAdmin = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user?.isAdmin) {
      return ResponseHandler.forbidden(res);
    }
    next();
  } catch (err) {
    return ResponseHandler.serverError(res, err.message);
  }
};

const authJwt = {
  verifyToken,
  isAdmin,
};

module.exports = authJwt;
