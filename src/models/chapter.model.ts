import mongoose from "mongoose";

const chapterSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Title is required"] },
    order: { type: Number, required: [true, "Order is required"] },
    iconUrl: { type: String, required: [true, "Icon is required"] },
    languageId: { type: String, default: "en" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Chapter", chapterSchema);
