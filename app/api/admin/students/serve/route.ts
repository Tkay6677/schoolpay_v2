import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { verifyAuth } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    const user = await verifyAuth(token);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { studentId, dailyRate } = await req.json();
    if (!studentId || dailyRate === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Deduct balance
    await db.collection('students').updateOne(
      { _id: new ObjectId(studentId) },
      { $inc: { balance: -dailyRate }, $set: { updatedAt: new Date() } }
    );

    // Record lunch order
    const orderRes = await db.collection('lunchOrders').insertOne({
      studentId: new ObjectId(studentId),
      date: new Date(),
      status: 'served',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ message: 'Lunch served', orderId: orderRes.insertedId });
  } catch (error: any) {
    console.error('Error serving lunch:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
