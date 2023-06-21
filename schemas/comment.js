const mongoose = require("mongoose");

const commentSchema = mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  postId: {
    type: String,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  nickname: {
    type: String,
    required: true,
  },
});

commentSchema.set("timestamps", true);

module.exports = mongoose.model("comments", commentSchema);
