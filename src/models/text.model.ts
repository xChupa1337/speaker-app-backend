import mongoose from "mongoose";

const textSchema = new mongoose.Schema({
  content: { type: String, required: true },
});

module.exports = mongoose.model("Text", textSchema);
