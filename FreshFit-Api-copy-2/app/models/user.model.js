const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema(
    {
      firstName: {
        type: String,
        required: true,
      },
      lastName: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
        unique: true,
      },
      password: {
        type: String,
        required: true,
        select: false,
      },
      isAdmin: {
        type: Boolean,
        default: false,
      },
      isEmailVerified: {
        type: Boolean,
        default: false,
      },
      forgotPasswordCode: {
        type: String,
        default: null,
      },
      lastUpdatedForgotPasswordCode: {
        type: Date,
        default: null,
      },
      phone: {
        type: String,
      },
    },
    {
      timestamps: true,
    }
  )
);

module.exports = User;
