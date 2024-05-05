const db = require("../models");
const User = db.user;
const Tournament = db.tournament;
const Team = db.team;

const helpers = require("../helpers");
const Response = helpers.response;
const Email = helpers.email;

const authConfig = require("../config/auth.config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const serverConfig = require("../config/server.config");

exports.update = async (req, res) => {
  try {
    const user = req.user;

    if (!user) return Response.notFound(res, "User not found.");
    if (req.body.firstName && req.body.firstName !== user.firstName) {
      user.firstName = req.body.firstName;
    }
    if (req.body.lastName && req.body.lastName !== user.lastName) {
      user.lastName = req.body.lastName;
    }

    if (req.body.email && req.body.email !== user.email) {
      const userTemp = await User.findOne({
        email: req.body.email,
        _id: { $ne: user._id },
      }).exec();

      if (userTemp) return Response.badRequest(res, "Email already exists.");

      user.email = req.body.email;
      user.isEmailVerified = false;
    }

    user.save();

    const userObj = user.toObject();
    delete userObj.password;

    return Response.success(res, {
      message: "Your account has been updated successfully!",
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
    const user = await User.findByIdAndRemove(req.userId).exec();

    if (!user) return Response.notFound(res, "User not found.");

    return Response.success(res, {
      message: "Your account has been deleted successfully!",
    });
  } catch (err) {
    return Response.serverError(res, err.message);
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = req.user;
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

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select("+password").exec();

    const isPasswordValid = bcrypt.compareSync(oldPassword, user.password);
    if (!isPasswordValid)
      return Response.unauthorized(res, "Old password is incorrect.");

    user.password = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(8));
    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    return Response.success(res, {
      message: "Your password has been changed successfully!",
      data: {
        user: userObj,
      },
    });
  } catch (err) {
    return Response.serverError(res, err.message);
  }
};

exports.generateEmailToken = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return Response.notFound(res, "User not found.");

    if (user.isEmailVerified) {
      return Response.success(res, {
        message: "Email already verified.",
      });
    }

    const lastVerificationEmailSentDate = user.lastSentVerification;
    if (lastVerificationEmailSentDate) {
      const diff = new Date() - lastVerificationEmailSentDate;
      const diffInMinutes = Math.floor(diff / 1000 / 60);
      if (diffInMinutes < 5) {
        return Response.badRequest(res, "Email already sent.");
      }
    } else {
      user.lastSentVerification = new Date();
      await user.save();
    }

    const token = jwt.sign({ id: user._id }, authConfig.SECRET, {
      expiresIn: "1d",
    });

    const fromUrl = req.body.fromUrl || serverConfig.URL;

    const url = `${serverConfig.URL}/verify-email/${token}?redirectUrl=${fromUrl}`;

    await Email.send({
      to: user.email,
      subject: "Travel Booking - Verify Your Email",
      html: `
      <h1>Travel Booking - Verify Your Email</h1>
      <p>Hi ${user.username},</p>
      <p>Thank you for registering with us.</p>
      <p>Please click on the link below to verify your email address.</p>
      <a href="${url}" style="background-color: #EF4444; border-radius: 5px; border: none; color: white; padding: 15px 32px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px;">Verify Email</a>
      <p>Regards,</p>
      <p>Travel Booking Team</p>`,
    });

    return Response.success(res, {
      message: "Email verification link sent successfully.",
    });
  } catch (err) {
    return Response.serverError(res, err.message);
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { id } = jwt.verify(req.params.token, authConfig.SECRET);

    const user = await User.findById(id);
    if (!user) return Response.notFound(res, "User not found.");

    if (user.isEmailVerified) {
      return Response.success(res, {
        message: "Email already confirmed.",
      });
    }

    user.isEmailVerified = true;
    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    return Response.success(res, {
      message: "Email confirmed successfully.",
      data: {
        userObj,
      },
    });
  } catch (err) {
    return Response.serverError(res, err.message);
  }
};

exports.findOne = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return Response.notFound(res, "User not found.");

    const teams = await Team.find({
      $or: [{ creator: user._id }, { players: user._id }],
    }).exec();

    const tournaments = await Tournament.find({
      registeredTeams: { $in: teams.map((team) => team._id) },
    });

    let matchesWon = 0;
    let matchesLost = 0;

    for (const tournament of tournaments) {
      const lastMatch =
        tournament.bracket.rounds[tournament.bracket.rounds.length - 1]
          .matches[0];
      if (lastMatch.winner) {
        if (lastMatch.winner.toString() === user._id.toString()) matchesWon++;
        else matchesLost++;
      }
    }

    const userObj = user.toObject();
    delete userObj.password;

    userObj.matchesWon = matchesWon;
    userObj.matchesLost = matchesLost;
    userObj.matchesPlayed = tournaments.length;

    return Response.success(res, {
      data: {
        user: userObj,
      },
    });
  } catch (err) {
    console.log(err);
    return Response.serverError(res, err.message);
  }
};

exports.findOneAdmin = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return Response.notFound(res, "User not found.");
    if (!user.isAdmin) return Response.unauthorized(res, "Unauthorized.");

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

exports.updateProfilePic = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return Response.notFound(res, "User not found.");

    user.profilePic = req.file.filename;
    await user.save();

    return Response.success(res, {
      message: "Profile picture updated successfully.",
      data: {
        user,
      },
    });
  } catch (err) {
    return Response.serverError(res, err.message);
  }
};
