const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    date: {
      type: Date,
    },
    whatToBring: [
      {
        type: String,
      },
    ],
    longitude: {
      type: Number,
    },
    latitude: {
      type: Number,
    },
    difficultyLevel: {
      type: String,
      enum: ["Easy", "Moderate", "Hard"],
    },
    shortDescription: {
      type: String,
    },
    distance: {
      type: Number,
    },
    duration: {
      type: Number,
    },
    elevation: {
      type: Number,
    },
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
    },
    going: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    image: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

EventSchema.pre(/^find/, function (next) {
  this.populate("comments");
  next();
});

const Event = mongoose.model("Event", EventSchema);

module.exports = Event;
