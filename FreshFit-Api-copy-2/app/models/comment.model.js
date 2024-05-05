const { Schema, model } = require("mongoose");
const commentSchema = new Schema({
  postedBy: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  text: {
    type: String,
    required: true,
  },
  replies: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
});

commentSchema.pre(/^find/, function (next) {
  this.populate("replies").populate("postedBy");
  next();
});

const Comment = model("Comment", commentSchema);

module.exports = Comment;
