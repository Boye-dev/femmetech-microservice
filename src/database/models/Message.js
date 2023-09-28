const mongoose = require("mongoose");
const { Schema } = mongoose;

const MessageSchema = new Schema(
  {
    content: {
      text: { type: String },
      files: {
        default: undefined,
        type: [{ url: { type: String }, filetype: { type: String } }],
      },
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "chat" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("message", MessageSchema);
