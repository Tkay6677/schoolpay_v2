import { ObjectId } from 'mongodb';

export interface LunchOrder {
  _id?: ObjectId;
  studentId: ObjectId;
  menuItemId: ObjectId;
  date: Date;
  specialInstructions: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}