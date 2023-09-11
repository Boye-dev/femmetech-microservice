const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const PostSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    text: { type: String, required: true },
    images: [{ type: String }],
    likes: { type: Number, default: 0 },
    comments: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
        text: { type: String },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("post", PostSchema);
