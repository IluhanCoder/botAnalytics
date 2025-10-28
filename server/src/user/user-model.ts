import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "../../../shared/types/user-types";

const userSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  }
});

export type UserDocument = IUser & Document;

const UserModel = mongoose.model<UserDocument>('User', userSchema);
export default UserModel;
