import mongoose from "mongoose";

const premiumEmailSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

export const PremiumEmail = mongoose.model("PremiumEmail", premiumEmailSchema);
