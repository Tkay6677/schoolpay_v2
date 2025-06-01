import { ObjectId } from 'mongodb';

export interface LunchPreference {
  _id?: ObjectId;
  studentId: ObjectId;
  dietary: string[];
  allergies: string[];
  favorites: ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}