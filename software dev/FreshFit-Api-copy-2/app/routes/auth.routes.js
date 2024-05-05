const controller = require("../controllers/auth.controller");
const { upload } = require("../middlewares");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/auth/login", controller.login);
  app.post("/api/auth/admin/login", controller.adminLogin);
  app.post(
    "/api/auth/register",
    [upload.imageUpload.single("profilePicture")],
    controller.register
  );

  app.post("/api/auth/forgot-password", controller.forgotPassword);
  app.post("/api/auth/reset-password", controller.resetPassword);
  app.post(
    "/api/auth/verify-reset-password-code",
    controller.verifyResetPasswordCode
  );
  app.post("/api/auth/get-user", controller.getUser);
  
};
