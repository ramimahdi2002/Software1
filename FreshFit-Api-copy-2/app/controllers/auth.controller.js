const authConfig = require("../config/auth.config");
const serverConfig = require("../config/server.config");
const db = require("../models");
const User = db.user;

const helpers = require("../helpers");
const Response = helpers.response;
const Email = helpers.email;

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.register = async (req, res) => {
  try {
    const exists = await User.findOne({
      email: req.body.email,
    }).exec();

    if (exists)
      return Response.badRequest(
        res,
        "User with this email address already exists."
      );

    // find if email exists ignore case
    const emailExists = await User.findOne({
      email: { $regex: new RegExp(req.body.email, "i") },
    }).exec();

    if (emailExists)
      return Response.badRequest(res, "User with this email already exists.");

    const user = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      dob: req.body.dob,
      password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8)),
      profilePic: req.file?.filename ?? "placeholder.jpg",
    });
    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    const token = jwt.sign({ id: user._id }, authConfig.SECRET, {
      expiresIn: 86400, // 24 hours
    });

    try {
      const fromUrl = req.body.fromUrl || serverConfig.URL;

      const url = `${serverConfig.URL}/verify-email/${token}?r=${fromUrl}`;

      await Email.send({
        to: user.email,
        subject: "Welcome to Hiking Planner!",
        html: `
        <h1>Welcome to Hiking Planner!</h1>
        <p>Hi ${user.firstName},</p>
        <p>Thank you for registering with us.</p>
        <p>Please click on the link below to verify your email address.</p>
        <a href="${url}" style="background-color: #EF4444; border-radius: 5px; border: none; color: white; padding: 15px 32px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px;">Verify Email</a>
        <p>Regards,</p>
        <p>Travel Booking Team</p>`,
      });
    } catch (err) {
      console.log(err);
    }

    return Response.success(res, {
      message: "User registered successfully!",
      data: {
        user: userObj,
        token: token,
      },
    });
  } catch (err) {
    return Response.serverError(res, err.message);
  }
};

exports.login = async (req, res) => {
  try {
    const user = await User.findOne({
      email: { $regex: new RegExp(req.body.email, "i") },
    })
      .select("+password")
      .exec();

    if (!user) return Response.unauthorized(res, "Invalid Login Credentials.");

    const isPasswordValid = bcrypt.compareSync(
      req.body.password,
      user.password
    );

    if (!isPasswordValid)
      return Response.unauthorized(res, "Invalid Login Credentials.");

    const token = jwt.sign({ id: user._id }, authConfig.SECRET, {
      expiresIn: req.body.rememberMe ? 86400 * 30 : 86400, // 24 hours or 30 days
    });

    const userObj = user.toObject();
    delete userObj.password;

    return Response.success(res, {
      message: "User logged in successfully!",
      data: {
        user: userObj,
        token: token,
      },
    });
  } catch (err) {
    return Response.serverError(res, err.message);
  }
};

exports.adminLogin = async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
    })
      .select("+password")
      .exec();

    if (!user) return Response.unauthorized(res, "User not found.");

    if (!user.isAdmin) return Response.unauthorized(res, "No admin access.");

    const isPasswordValid = bcrypt.compareSync(
      req.body.password,
      user.password
    );

    if (!isPasswordValid)
      return Response.unauthorized(res, "Invalid password.");

    if (!user.isAdmin) return Response.unauthorized(res, "No admin access.");

    const token = jwt.sign({ id: user._id }, authConfig.SECRET, {
      expiresIn: 86400, // 24 hours
    });

    const userObj = user.toObject();
    delete userObj.password;

    return Response.success(res, {
      message: "User logged in successfully!",
      data: {
        user: userObj,
        token: token,
      },
    });
  } catch (err) {
    return Response.serverError(res, err.message);
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    console.log(req.body);
    const user = await User.findOne({
      email: {
        $regex: new RegExp(req.body.email, "i"),
      },
    });
    if (user) {
      // generate a random 6 digit code
      const code = Math.floor(100000 + Math.random() * 900000);
      user.forgotPasswordCode = code;
      user.lastUpdatedForgotPasswordCode = new Date();
      await user.save();
      const email = await Email.send({
        to: user.email,
        subject: "Reset Password",
        message: `Your reset password code is ${code}`,
      });
      if (email) {
        return Response.success(res, {
          message: "Email sent successfully!",
          data: { email: user.email },
        });
      }
      return Response.error(
        res,
        "Failed to send email, please try again later."
      );
    } else {
      return Response.unauthorized(res, "User not found.");
    }
  } catch (err) {
    return Response.serverError(res, err.message);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const code = req.body.code;
    const password = req.body.password;
    const user = await User.findOne({
      email: req.body.email,
    });

    if (!user) return Response.unauthorized(res, "User not found.");

    if (user.forgotPasswordCode !== code)
      return Response.unauthorized(res, "Invalid code.");

    const now = new Date();
    const diff = Math.abs(now - user.lastUpdatedForgotPasswordCode);

    if (diff > 600000) {
      // 10 minutes
      return Response.unauthorized(res, "Code expired.");
    }

    user.password = bcrypt.hashSync(password, bcrypt.genSaltSync(8));
    user.forgotPasswordCode = null;
    user.lastUpdatedForgotPasswordCode = null;

    await user.save();
    const userObj = user.toObject();
    delete userObj.password;

    return Response.success(res, {
      message: "Password reset successfully!",
      data: {
        user: userObj,
      },
    });
  } catch (err) {
    return Response.serverError(res, err.message);
  }
};

exports.verifyResetPasswordCode = async (req, res) => {
  try {
    const code = req.body.code;
    const user = await User.findOne({
      email: req.body.email,
      forgotPasswordCode: code,
    }).exec();

    if (!user) return Response.unauthorized(res, "Invalid code.");

    const now = new Date();

    const diff = Math.abs(now - user.lastUpdatedForgotPasswordCode);

    if (diff > 600000) {
      // 10 minutes
      return Response.unauthorized(res, "Code expired.");
    }

    return Response.success(res, {
      message: "Code verified successfully!",
      data: { email: user.email },
    });
  } catch (err) {
    return Response.serverError(res, err.message);
  }
};

//get user info by id
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).exec();
    if (!user) return Response.notFound(res, "User not found.");
    const userObj = user.toObject();
    delete userObj.password;
    return Response.success(res, {
      message: "User found successfully!",
      data: {
        user: userObj,
      },
    });
  } catch (err) {
    return Response.serverError(res, err.message);
  }
};

//update user info by id
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).exec();
    if (!user) return Response.notFound(res, "User not found.");
    user.firstName = req.body.firstName;
    user.lastName = req.body.lastName;
    user.email = req.body.email;
    user.dob = req.body.dob;
    user.profilePic = req.file?.filename ?? "placeholder.jpg";
    await user.save();
    const userObj = user.toObject();
    delete userObj.password;
    return Response.success(res, {
      message: "User updated",

      data: {
        user: userObj,
      },
    });
  } catch (err) {
    return Response.serverError(res, err.message);
  }
};

//delete user by id
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).exec();
    if (!user) return Response.notFound(res, "User not found.");
    await user.remove();
    return Response.success(res, {
      message: "User deleted successfully!",
    });
  } catch (err) {
    return Response.serverError(res, err.message);
  }
};
