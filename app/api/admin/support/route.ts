import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { verifyAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Verify admin authentication
    const token = request.headers.get('authorization')?.split(' ')[1];
    const user = await verifyAuth(token);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Get all support tickets with parent information
    const tickets = await db.collection('support_tickets')
      .aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'parentId',
            foreignField: '_id',
            as: 'parent'
          }
        },
        {
          $unwind: '$parent'
        },
        {
          $project: {
            _id: 1,
            parentId: 1,
            parentName: '$parent.name',
            subject: 1,
            message: 1,
            status: 1,
            priority: 1,
            createdAt: 1,
            updatedAt: 1,
            attachment: 1,
            adminResponse: 1,
            adminResponseDate: 1,
            replies: 1
          }
        },
        {
          $sort: { createdAt: -1 }
        }
      ]).toArray();

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 