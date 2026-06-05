import mongoose from "mongoose";

const mediaRefSchema = new mongoose.Schema(
  {
    kind: { type: String, enum: ["video", "audio", "text"], required: true },
    id: { type: mongoose.Schema.Types.ObjectId, required: true },
  },
  { _id: false },
);

const questionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["simple", "interactive", "validation"],
      required: true,
    },
    prompt: { type: String, required: true },
    options: [String],
    correctAnswer: { type: mongoose.Schema.Types.Mixed },
    explanation: { type: String },
    mediaRef: mediaRefSchema,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Question", questionSchema);
