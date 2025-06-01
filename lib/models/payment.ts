import { ObjectId } from 'mongodb';

export interface Payment {
  _id?: ObjectId;
  studentId: ObjectId;
  amount: number;
  type: 'daily' | 'weekly' | 'monthly';
  status: 'pending' | 'completed' | 'failed';
  stripePaymentId?: string;
  createdAt: Date;
  updatedAt: Date;
}