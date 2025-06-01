import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { verifyAuth } from '@/lib/auth';

// Get lunch preferences for a student
export async function GET(req: Request) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1];
    const user = await verifyAuth(token);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Verify user has access to this student
    if (user.role === 'parent') {
      const student = await db.collection('students').findOne({
        _id: new ObjectId(studentId),
        parentId: new ObjectId(user.id)
      });

      if (!student) {
        return NextResponse.json(
          { error: 'Student not found or access denied' },
          { status: 404 }
        );
      }
    }

    const preferences = await db.collection('lunchPreferences').findOne({
      studentId: new ObjectId(studentId)
    });

    return NextResponse.json(preferences || { dietary: [], allergies: [], favorites: [] });
  } catch (error) {
    console.error('Error fetching lunch preferences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update lunch preferences
export async function PUT(req: Request) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1];
    const user = await verifyAuth(token);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { studentId, dietary, allergies, favorites } = await req.json();

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Verify user has access to this student
    if (user.role === 'parent') {
      const student = await db.collection('students').findOne({
        _id: new ObjectId(studentId),
        parentId: new ObjectId(user.id)
      });

      if (!student) {
        return NextResponse.json(
          { error: 'Student not found or access denied' },
          { status: 404 }
        );
      }
    }

    // Upsert preferences
    await db.collection('lunchPreferences').updateOne(
      { studentId: new ObjectId(studentId) },
      {
        $set: {
          dietary: dietary || [],
          allergies: allergies || [],
          favorites: favorites || [],
          updatedAt: new Date(),
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