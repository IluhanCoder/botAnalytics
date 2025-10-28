// models/Dataset.js
import mongoose from "mongoose";

const datasetSchema = new mongoose.Schema({
  uploadedAt: { type: Date, default: Date.now },
  content: { type: Object, required: true }, // будь-який JSON,
  analyticsResults: [{ type: mongoose.Schema.Types.ObjectId, ref: "AnalyticsResult" }]
});

export const DatasetModel = mongoose.model("Dataset", datasetSchema);
