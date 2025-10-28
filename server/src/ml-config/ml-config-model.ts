import mongoose, { Document, Schema } from "mongoose";

export interface IMLConfig {
  _id: string;
  keywordsCount: number;
  topicsCount: number;
  termsPerTopic: number;
  sentimentEnabled: boolean;
  nerEnabled: boolean;
  classificationEnabled: boolean;
  classificationLabels: string[];
  updatedAt: Date;
}

const mlConfigSchema: Schema = new Schema({
  keywordsCount: { type: Number, default: 10 },
  topicsCount: { type: Number, default: 2 },
  termsPerTopic: { type: Number, default: 5 },
  sentimentEnabled: { type: Boolean, default: true },
  nerEnabled: { type: Boolean, default: true },
  classificationEnabled: { type: Boolean, default: true },
  classificationLabels: {
    type: [String],
    default: ["Technology", "Finance", "Sports", "Politics", "Health", "Entertainment", "General"]
  },
  updatedAt: { type: Date, default: Date.now }
});

export type MLConfigDocument = IMLConfig & Document;

const MLConfigModel = mongoose.model<MLConfigDocument>('MLConfig', mlConfigSchema);
export default MLConfigModel;
