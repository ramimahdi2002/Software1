//do the routing
module.exports = app => {
  const comments = require("../controllers/comment.controller.js");
  const { verifyToken } = require("../middlewares/authJwt");
  const { validateComment } = require("../middlewares/validators");

  var router = require("express").Router();
  router.post("/", verifyToken, validateComment, comments.create);
  router.get("/", verifyToken, comments.findAll);
  router.get("/:id", verifyToken, comments.findOne);
  router.put("/:id", verifyToken, comments.update);
  router.delete("/:id", verifyToken, comments.delete);
  router.delete("/", verifyToken, comments.deleteAll);
  app.use("/api/comments", router);
};
