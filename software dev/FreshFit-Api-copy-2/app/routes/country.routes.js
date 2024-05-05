const { authJwt } = require("../middlewares");
const controller = require("../controllers/country.controller");

module.exports = function (app) {
  app.use(function (_req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/countries", controller.findAll);
  app.get("/api/countriess", controller.createCountry);
  app.delete("/api/countries/:id", controller.deleteCountry);
};
