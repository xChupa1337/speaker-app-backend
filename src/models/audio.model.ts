import mongoose from "mongoose";

const audioSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    transcript: { type: String },
    durationSec: { type: Number },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Audio", audioSchema);
