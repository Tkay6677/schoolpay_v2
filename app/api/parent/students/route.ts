import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { verifyAuth } from '@/lib/auth';

// GET all students for a parent
export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    const user = await verifyAuth(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    const students = await db.collection('students')
      .find({ parent: new ObjectId(user.id) })
      .toArray();

    return NextResponse.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST new student
export async function POST(request: Request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    const user = await verifyAuth(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      name, 
      grade, 
      admissionNumber,
      dietaryPreferences = [],
      allergies = [],
      otherAllergies = '',
      additionalNotes = ''
    } = body;

    if (!name || !grade || !admissionNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Check if student already exists
    const existingStudent = await db.collection('students').findOne({ admissionNumber });
    if (existingStudent) {
      return NextResponse.json(
        { error: 'Student with this admission number already exists' },
        { status: 400 }
      );
    }

    const result = await db.collection('students').insertOne({
      name,
      grade,
      admissionNumber,
      parent: new ObjectId(user.id),
      balance: 0,
      status: 'active',
      dietaryPreferences,
      allergies,
      otherAllergies,
      additionalNotes,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      { message: 'Student created successfully', studentId: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update student
export async function PUT(request: Request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    const user = await verifyAuth(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('id');

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { 
      name, 
      grade, 
      admissionNumber, 
      status,
      dietaryPreferences,
      allergies,
      otherAllergies,
      additionalNotes
    } = body;

    const client = await clientPromise;
    const db = client.db();

    // Verify student belongs to parent
    const existingStudent = await db.collection('students').findOne({
      _id: new ObjectId(studentId),
      parent: new ObjectId(user.id)
    });

    if (!existingStudent) {
      return NextResponse.json(
        { error: 'Student not found or unauthorized' },
        { status: 404 }
      );
    }

    const result = await db.collection('students').updateOne(
      { _id: new ObjectId(studentId) },
      {
        $set: {
          ...(name && { name }),
          ...(grade && { grade }),
          ...(admissionNumber && { admissionNumber }),
          ...(status && { status }),
          ...(dietaryPreferences && { dietaryPreferences }),
          ...(allergies && { allergies }),
          ...(otherAllergies !== undefined && { otherAllergies }),
          ...(additionalNotes !== undefined && { additionalNotes }),
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json(
      { message: 'Student updated successfully', modifiedCount: result.modifiedCount }
    );
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE student
export async function DELETE(request: Request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    const user = await verifyAuth(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('id');

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Verify student belongs to parent
    const existingStudent = await db.collection('students').findOne({
      _id: new ObjectId(studentId),
      parent: new ObjectId(user.id)
    });

    if (!existingStudent) {
      return NextResponse.json(
        { error: 'Student not found or unauthorized' },
        { status: 404 }
      );
    }

    const result = await db.collection('students').deleteOne({
      _id: new ObjectId(studentId)
    });

    return NextResponse.json(
      { message: 'Student deleted successfully', deletedCount: result.deletedCount }
    );
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 