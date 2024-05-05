const db = require("../models");
const User = db.user;

const helpers = require("../helpers");
const Response = helpers.response;

const bcrypt = require("bcryptjs");

exports.findAll = async (req, res) => {
  try {
    const users = await User.find().exec();

    return Response.success(res, {
      data: {
        users,
      },
    });
  } catch (err) {
    console.log(err);
    return Response.serverError(res, err.message);
  }
};

exports.findOne = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).exec();

    if (!user) return Response.notFound(res, "User not found.");

    const userObj = user.toObject();
    delete userObj.password;

    return Response.success(res, {
      data: {
        user: userObj,
      },
    });
  } catch (err) {
    return Response.serverError(res, err.message);
  }
};

exports.update = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
      },
      { new: true }
    ).exec();

    if (!user) return Response.notFound(res, "User not found.");

    const userObj = user.toObject();
    delete userObj.password;

    return Response.success(res, {
      message: "User updated successfully!",
      data: {
        user: userObj,
      },
    });
  } catch (err) {
    return Response.serverError(res, err.message);
  }
};

exports.delete = async (req, res) => {
  try {
    const user = await User.findByIdAndRemove(req.params.id).exec();

    if (!user) return Response.notFound(res, "User not found.");

    return Response.success(res, {
      message: "User deleted successfully!",
      data: {
        user,
      },
    });
  } catch (err) {
    return Response.serverError(res, err.message);
  }
};
exports.create = async (req, res) => {
  try {
    const user = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8)),
      isInfluencer: req.body.isInfluencer,
      promoCodes: req.body.promoCodes,
    });

    const userObj = user.toObject();
    delete userObj.password;

    return Response.success(res, {
      message: "User created successfully!",
      data: {
        user: userObj,
      },
    });
  } catch (err) {
    return Response.serverError(res, err.message);
  }
};
