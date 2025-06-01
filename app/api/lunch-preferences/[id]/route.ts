import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { verifyAuth } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1];
    const user = await verifyAuth(token);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    const preferences = await db.collection('lunchPreferences').findOne({
      studentId: new ObjectId(params.id)
    });

    if (!preferences) {
      return NextResponse.json(
        { error: 'Preferences not found' },
        { status: 404 }
      );
    }

    // Verify user has access to these preferences
    if (user.role !== 'admin') {
      const student = await db.collection('students').findOne({
        _id: new ObjectId(params.id),
        parentId: new ObjectId(user.id)
      });

      if (!student) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error fetching lunch preferences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1];
    const user = await verifyAuth(token);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { dietary, allergies } = await req.json();

    const client = await clientPromise;
    const db = client.db();

    // Verify user has access to update these preferences
    if (user.role !== 'admin') {
      const student = await db.collection('students').findOne({
        _id: new ObjectId(params.id),
        parentId: new ObjectId(user.id)
      });

      if (!student) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    await db.collection('lunchPreferences').updateOne(
      { studentId: new ObjectId(params.id) },
      {
        $set: {
          dietary,
          allergies,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    return NextResponse.json({ message: 'Preferences updated successfully' });
  } catch (error) {
    console.error('Error updating lunch preferences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}