import { ObjectId } from 'mongodb';

export interface Student {
  _id?: ObjectId;
  name: string;
  grade: string;
  studentId: string;
  parentId?: ObjectId;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}