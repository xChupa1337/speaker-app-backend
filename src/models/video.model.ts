import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  url: { type: String, required: true },
  caption: { type: String },
  transcript: { type: String },
  durationSec: { type: Number },
});

module.exports = mongoose.model("Video", videoSchema);
