import { IUser } from './user-types';
export interface IStopword {
  content: string;
  createdAt: Date,
  updatedAt: Date
}

export type StopwordDocument = IStopword & Document;
export type StopwordResponse = IStopword & {_id: string};

export interface StopwordFetchResponse {
  stopwords: StopwordResponse[];
}