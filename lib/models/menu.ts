import { ObjectId } from 'mongodb';

export interface MenuItem {
  _id?: ObjectId;
  name: string;
  description: string;
  price: number;
  category: string;
  allergens: string[];
  available: boolean;
  createdAt: Date;
  updatedAt: Date;
}