import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    langFrom: { type: String },
    langTo: { type: String },
    darkMode: { type: Boolean },
  },
  { _id: false },
);

const progressSchema = new mongoose.Schema(
  {
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: "Topic" },
    completedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    password: { type: String, required: true, minLength: 6, maxLength: 255 },
    code: Number,
    name: { type: String },
    isVerified: { type: Boolean, default: false },
    subscription: {
      type: String,
      enum: ["standard", "premium"],
      default: "standard",
    },
    settings: settingsSchema,
    progress: [progressSchema],
  },
  { timestamps: true },
);

userSchema.set("toJSON", {
  transform: function (doc, ret, options) {
    delete ret.password;
    delete ret.__v;
    delete ret.code;
    return ret;
  },
});

export const User = mongoose.model("User", userSchema);
