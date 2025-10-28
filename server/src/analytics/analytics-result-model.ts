import mongoose from "mongoose";

const AnalyticsResultSchema = new mongoose.Schema(
  {
    result: { type: Array, default: [] },
    dataset: { type: mongoose.Schema.Types.ObjectId, ref: "Dataset", required: true }
  },
  { timestamps: true }
);

export default mongoose.model("AnalyticsResult", AnalyticsResultSchema);