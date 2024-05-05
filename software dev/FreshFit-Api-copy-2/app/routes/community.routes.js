const express = require("express");
const middleware = require("../middlewares");
const communityController = require("../controllers/community.controller");

const router = express.Router();

const upload = middleware.upload;

router.get(
  "/",
  middleware.authJwt.verifyToken,
  communityController.getAllCommunities
);

router.post(
  "/",
  [upload.imageUpload.single("image"), upload.addToBody],
  communityController.createCommunity
);

router.put("/:id", (req, res) => {
  res.json({ message: "Update a community by id" });
});

router.delete("/:id", (req, res) => {
  res.json({ message: "Delete a community by id" });
});

router.delete("/", (req, res) => {
  res.json({ message: "Delete all communities" });
});

router.post(
  "/:communityId/join",
  middleware.authJwt.verifyToken,
  communityController.joinCommunity
);

router.post(
  "/event/:eventId/join",
  middleware.authJwt.verifyToken,
  communityController.joinEvent
);

router.post(
  "/event/:eventId/addComment",
  middleware.authJwt.verifyToken,
  communityController.addComment
);

router.post(
  "/event/:eventId/leave",
  middleware.authJwt.verifyToken,
  communityController.leaveEvent
);

router.post("/:id/leave", (req, res) => {
  res.json({ message: "Leave a community" });
});

router.get("/:id/members", (req, res) => {
  res.json({ message: "Get all members of a community" });
});

router.post("/:id/members/:userId", (req, res) => {
  res.json({ message: "Add a member to a community" });
});

router.delete("/:id/members/:userId", (req, res) => {
  res.json({ message: "Remove a member from a community" });
});

router.post(
  "/:communityId/events",
  [upload.imageUpload.single("image"), upload.addToBody],
  communityController.addEvent
);
router.get("/:id", communityController.getCommunityById);

module.exports = (app) => {
  app.use("/api/community", router);
};
