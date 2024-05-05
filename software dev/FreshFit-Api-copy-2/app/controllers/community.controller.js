const models = require("../models");
const helpers = require("../helpers");

const Community = models.community;
const Comment = models.comment;
const Event = models.event;
const ResponseHandler = helpers.response;

const createCommunity = async (req, res) => {
  try {
    const { name, description, file, shortDescription } = req.body;

    if (!name) {
      return ResponseHandler.badRequest(res, "Community name is required");
    }

    if (!description) {
      return ResponseHandler.badRequest(
        res,
        "Community description is required"
      );
    }

    if (!file) {
      return ResponseHandler.badRequest(res, "Community image is required");
    }

    if (!shortDescription) {
      return ResponseHandler.badRequest(
        res,
        "Community short description is required"
      );
    }

    const newCommunity = new Community({
      name,
      description,
      image: file,
      shortDescription,
    });

    await newCommunity.save();

    return ResponseHandler.success(res, {
      data: {
        community: newCommunity,
      },
      message: "Community created successfully",
    });
  } catch (error) {
    return ResponseHandler.serverError(res, error.message);
  }
};

const getAllCommunities = async (req, res) => {
  try {
    let onlyMyCommunities = req.query.onlyMyCommunities;

    if (onlyMyCommunities) {
      onlyMyCommunities = JSON.parse(onlyMyCommunities);
    }

    const filter = onlyMyCommunities
      ? {
          members: req.user._id,
        }
      : {};

    const communities = await Community.find(filter);
    return ResponseHandler.success(res, {
      data: {
        communities,
      },
      message: "Communities retrieved successfully",
    });
  } catch (error) {
    console.error(error);
    return ResponseHandler.serverError(res, error.message);
  }
};

const getCommunityById = async (req, res) => {
  try {
    const communityDocument = await Community.findById(req.params.id).populate(
      "members events"
    );
    if (!communityDocument) {
      return ResponseHandler.notFound(res, "Community not found");
    }

    const community = communityDocument.toObject();

    return ResponseHandler.success(res, {
      data: {
        community,
      },
      message: "Community retrieved successfully",
    });
  } catch (error) {
    console.error(error);
    return ResponseHandler.serverError(res, error.message);
  }
};

const updateCommunity = async (req, res) => {
  try {
    const updatedCommunity = await Community.findByIdAndUpdate(
      req.params.communityId,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedCommunity) {
      return ResponseHandler.notFound(res, "Community not found");
    }

    return ResponseHandler.success(res, {
      data: {
        community: updatedCommunity,
      },
      message: "Community updated successfully",
    });
  } catch (error) {
    console.error(error);
    return ResponseHandler.serverError(res, error.message);
  }
};

const deleteCommunity = async (req, res) => {
  try {
    const deletedCommunity = await Community.findByIdAndDelete(
      req.params.communityId
    );
    if (!deletedCommunity) {
      return ResponseHandler.notFound(res, "Community not found");
    }

    return ResponseHandler.success(res, {
      data: {
        community: deletedCommunity,
      },
      message: "Community deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return ResponseHandler.serverError(res, error.message);
  }
};

const joinCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.communityId);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    const userId = req.user.id;

    if (community.members.includes(userId)) {
      return ResponseHandler.badRequest(
        res,
        "User is already a member of this community"
      );
    }

    community.members.push(userId);
    await community.save();

    return ResponseHandler.success(res, {
      data: {
        community,
      },
      message: "User joined community successfully",
    });
  } catch (error) {
    console.error(error);
    return ResponseHandler.serverError(res, error.message);
  }
};

const joinEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return ResponseHandler.notFound(res, "Event not found");
    }

    const userId = req.user.id;

    if (event.going.includes(userId)) {
      return ResponseHandler.badRequest(
        res,
        "User is already an attendee of this event"
      );
    }

    event.going.push(userId);
    await event.save();

    return ResponseHandler.success(res, {
      data: {
        event,
      },
      message: "User joined event successfully",
    });
  } catch (error) {
    console.error(error);
    return ResponseHandler.serverError(res, error.message);
  }
};

const leaveEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return ResponseHandler.notFound(res, "Event not found");
    }

    const userId = req.user.id;

    if (new Date(event.date) < new Date()) {
      return ResponseHandler.badRequest(res, "Event has already passed");
    }

    if (!event.going.includes(userId)) {
      return ResponseHandler.badRequest(
        res,
        "User is not an attendee of this event"
      );
    }

    event.going = event.going.filter(
      (attendeeId) => attendeeId.toString() !== userId
    );

    await event.save();

    return ResponseHandler.success(res, {
      data: {
        event,
      },
      message: "User left event successfully",
    });
  } catch (error) {
    console.error(error);
    return ResponseHandler.serverError(res, error.message);
  }
};

const leaveCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.communityId);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    const userId = req.user.id;

    if (!community.members.includes(userId)) {
      return ResponseHandler.badRequest(
        res,
        "User is not a member of this community"
      );
    }

    community.members = community.members.filter(
      (memberId) => memberId.toString() !== userId
    );
    await community.save();

    return ResponseHandler.success(res, {
      data: {
        community,
      },
      message: "User left community successfully",
    });
  } catch (error) {
    console.error(error);
    return ResponseHandler.serverError(res, error.message);
  }
};

const getCommunityMembers = async (req, res) => {
  try {
    const community = await Community.findById(req.params.communityId).populate(
      "members"
    );
    if (!community) {
      return ResponseHandler.notFound(res, "Community not found");
    }
    return ResponseHandler.success(res, {
      data: {
        members: community.members,
      },
      message: "Community members retrieved successfully",
    });
  } catch (error) {
    console.error(error);
    return ResponseHandler.serverError(res, error.message);
  }
};

const addEvent = async (req, res) => {
  try {
    const {
      name,
      description,
      date,
      whatToBring,
      longitude,
      latitude,
      difficultyLevel,
      shortDescription,
      distance,
      duration,
      elevation,
      file: image,
    } = req.body;

    if (!name) {
      return ResponseHandler.badRequest(res, "Event name is required");
    }

    if (!description) {
      return ResponseHandler.badRequest(res, "Event description is required");
    }

    if (!date) {
      return ResponseHandler.badRequest(res, "Event date is required");
    }

    if (!whatToBring) {
      return ResponseHandler.badRequest(res, "Event what to bring is required");
    }

    if (!longitude) {
      return ResponseHandler.badRequest(res, "Event longitude is required");
    }

    if (!latitude) {
      return ResponseHandler.badRequest(res, "Event latitude is required");
    }

    if (!difficultyLevel) {
      return ResponseHandler.badRequest(
        res,
        "Event difficultyLevel level is required"
      );
    }

    if (!shortDescription) {
      return ResponseHandler.badRequest(
        res,
        "Event short description is required"
      );
    }

    if (!distance) {
      return ResponseHandler.badRequest(res, "Event distance is required");
    }

    if (!duration) {
      return ResponseHandler.badRequest(res, "Event duration is required");
    }

    if (!elevation) {
      return ResponseHandler.badRequest(res, "Event elevation is required");
    }

    if (!image) {
      return ResponseHandler.badRequest(res, "Event image is required");
    }

    const whatToBringArray = whatToBring.split(",").map((item) => item.trim());

    const community = await Community.findById(req.params.communityId);
    if (!community) {
      return ResponseHandler.notFound(res, "Community not found");
    }

    const event = new Event({
      name,
      description,
      date,
      whatToBring: whatToBringArray,
      longitude,
      latitude,
      difficultyLevel,
      shortDescription,
      distance,
      duration,
      elevation,
      image,
      community: community._id,
    });
    await event.save();

    community.events.push(event._id);
    await community.save();

    return ResponseHandler.success(res, {
      data: {
        event,
      },
      message: "Event added to community successfully",
    });
  } catch (error) {
    console.error(error);
    return ResponseHandler.serverError(res, error.message);
  }
};

const addComment = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return ResponseHandler.notFound(res, "Event not found");
    }

    const userId = req.user.id;
    const { text, replyingTo } = req.body;

    const commentObject = await Comment.create({
      postedBy: userId,
      text: text,
    });

    if (replyingTo) {
      const replyingToComment = await Comment.findById(replyingTo);

      if (!replyingToComment) {
        return ResponseHandler.notFound(res, "Comment not found");
      }

      replyingToComment.replies.push(commentObject);

      await replyingToComment.save();
    } else {
      event.comments.push(commentObject._id.toString());
      await event.save();
    }

    await event.populate("comments");

    return ResponseHandler.success(res, {
      message: "Comment added Successfully",
      data: {
        event,
      },
    });
  } catch (error) {
    console.error(error);
    return ResponseHandler.serverError(res, error.message);
  }
};

module.exports = {
  createCommunity,
  getAllCommunities,
  getCommunityById,
  updateCommunity,
  deleteCommunity,
  joinCommunity,
  leaveCommunity,
  getCommunityMembers,
  addEvent,
  leaveEvent,
  joinEvent,
  addComment,
};
