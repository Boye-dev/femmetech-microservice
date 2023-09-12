const mongoose = require("mongoose");
const { Schema } = mongoose;

const JournalSchema = new Schema(
  {
    title: { type: String },
    content: { type: String, required: true },
    user: { type: mongoose.Schema.ObjectId, ref: "user" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("journal", JournalSchema);
