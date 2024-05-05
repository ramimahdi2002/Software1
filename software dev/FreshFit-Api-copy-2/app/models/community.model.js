const mongoose = require("mongoose");

const Community = mongoose.model(
  "Community",
  new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
      },
      description: {
        type: String,
      },
      shortDescription: {
        type: String,
      },
      members: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      events: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Event",
        },
      ],
      image: {
        type: String,
      },
    },
    {
      timestamps: true,
    }
  )
);

module.exports = Community;
