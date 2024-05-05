const db = require("../models");
const Comment = db.comment;
const User = db.user;
const Post = db.post;
const Community = db.community;
const helpers = require("../helpers");
const Response = helpers.response;

exports.create = async (req, res) => {
  try {
    const user = await User.findById(req.userId).exec();
    const post = await Post.findById
    (req.body.postId).exec();
    const community = await Community.findById
    (post.community).exec();
    const comment = new Comment({
      postedBy: user._id,
      postId: post._id,
      text: req.body.text,
    });
    comment.save();
    post.comments.push(comment._id);
    post.save();
    community.comments.push(comment._id);
    community.save();
    return Response.success(res, {
      message: "Comment created successfully!",
      data: {
        comment,
      },
    });
  }
  catch (err) {
    return Response.serverError(res, err.message);
  }
}

exports.findAll = async (req, res) => {
  try {
    const comments = await Comment.find().exec();
    return Response.success(res, {
      data: {
        comments,
      },
    });
  } catch (err) {
    return Response.serverError(res, err.message);
  }
};

exports.findOne = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id).exec();
    if (!comment) return Response.notFound(res, "Comment not found.");
    return Response.success(res, {
      data: {
        comment,
      },
    });
  } catch (err) {
    return Response.serverError(res, err.message);
  }
};

exports.update = async (req, res) => {
  try {
    const comment = await Comment.findByIdAndUpdate(req
    .params
    .id, req
    .body, { new: true });
    if (!comment) return Response.notFound(res, "Comment not found.");
    return Response.success(res, {
      message: "Comment updated successfully!",
      data: {
        comment,
      },
    });
  }
  catch (err) {
    return Response.serverError(res, err.message);
  }
}

exports.delete = async (req, res) => {
  try {
    const comment = await Comment.findByIdAndRemove(req.params.id).exec();
    if (!comment) return Response.notFound(res, "Comment not found.");
    return Response.success(res, {
      message: "Comment deleted successfully!",
    });
  } catch (err) {
    return Response.serverError(res, err.message);
  }
};

exports.deleteAll = async (req, res) => {
  try {
    await Comment.deleteMany().exec();
    return Response.success(res, {
      message: "All comments deleted successfully!",
    });
  } catch (err) {
    return Response.serverError(res, err.message);
  }
};
