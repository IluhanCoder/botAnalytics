import { IStopword } from '../../../shared/types/stopword-types';
import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "../../../shared/types/user-types";

const stopwordSchema = new Schema({
  content: { type: String, required: true },
}, {timestamps: true});

export type StopwordDocument = IStopword & Document;

const StopwordModel = mongoose.model<StopwordDocument>('Stopword', stopwordSchema);
export default StopwordModel;
