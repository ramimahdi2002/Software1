const { authJwt } = require("../middlewares");
const controller = require("../controllers/account.controller");
const { imageUpload } = require("../middlewares/upload.middleware");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.delete("/api/account", [authJwt.verifyToken], controller.delete);
  app.get("/api/account/me", [authJwt.verifyToken], controller.getMe);
  app.get("/api/account", [authJwt.verifyToken], controller.findOne);
  app.get("/api/account/admin", [authJwt.verifyToken], controller.findOne);

  app.put(
    "/api/account/change-password",
    [authJwt.verifyToken],
    controller.changePassword
  );

  app.post(
    "/api/account/profilePic",
    [authJwt.verifyToken, imageUpload.single("image")],
    controller.updateProfilePic
  );

  app.put("/api/account", [authJwt.verifyToken], controller.update);

  app.post(
    "/api/account/verify-email/generate",
    [authJwt.verifyToken],
    controller.generateEmailToken
  );
  app.post("/api/account/verify-email/:token", controller.verifyEmail);
};
