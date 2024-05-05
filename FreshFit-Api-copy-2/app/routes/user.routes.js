const { authJwt } = require("../middlewares");
const controller = require("../controllers/user.controller");

module.exports = function (app) {
  app.use(function (_req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/api/users",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.findAll
  );

  app.get(
    "/api/users/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.findOne
  );

  app.put(
    "/api/users/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.update
  );

  app.delete(
    "/api/users/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.delete
  );

  app.post(
    "/api/users",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.create
  );
  
};
