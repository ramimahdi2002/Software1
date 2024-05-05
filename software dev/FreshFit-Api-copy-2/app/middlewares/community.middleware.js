const { model } = require("mongoose");

//do the middleware for the community
model.exports = function (req, res, next) {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept"
  );
  next();
};
const db = require("../models");
const User = db.user;

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

export const authJwt = {
  verifyToken,
  isAdmin,
};
