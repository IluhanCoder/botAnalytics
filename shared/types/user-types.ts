export interface IUser {
  _id: string;
  username: string;
  password: string;
  role: 'user' | 'admin';
}

export type UserCredentials = Omit<IUser, "_id" | "role">;