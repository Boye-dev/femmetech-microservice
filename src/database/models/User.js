const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    salt: { type: String, required: true },
    role: { type: String, required: true },
    password: { type: String, required: true },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    profilePicture: {
      type: String,
      default: "http://www.gravatar.com/avatar/?d=mp",
    },
    schedule: {
      type: Object,
      monday: [{ open: { type: String }, close: { type: String } }],
      tuesday: [{ open: { type: String }, close: { type: String } }],
      wednesday: [{ open: { type: String }, close: { type: String } }],
      thursday: [{ open: { type: String }, close: { type: String } }],
      friday: [{ open: { type: String }, close: { type: String } }],
      saturday: [{ open: { type: String }, close: { type: String } }],
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.salt;
        delete ret.__v;
      },
    },
    timestamps: true,
  }
);

module.exports = mongoose.model("user", UserSchema);
