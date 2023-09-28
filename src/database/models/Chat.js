const mongoose = require("mongoose");
const { Schema } = mongoose;

const ChatSchema = new Schema(
  {
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
        unread: { type: Number, default: 0 },
      },
    ],
    lastmessage: { type: String },
    groupName: { type: String },

    isGroupChat: { type: Boolean, default: false },
    groupAdmin: {
      default: undefined,
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("chat", ChatSchema);
