import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { verifyAuth } from '@/lib/auth';

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

    const client = await clientPromise;
    const db = client.db();

    let students;
    if (user.role === 'admin') {
      // Admins can see all students
      students = await db.collection('students').find().toArray();
    } else {
      // Parents can only see their linked students
      students = await db.collection('students')
        .find({ parentId: new ObjectId(user.id) })
        .toArray();
    }

    return NextResponse.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1];
    const user = await verifyAuth(token);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { name, grade, studentId } = await req.json();

    if (!name || !grade || !studentId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Check if student ID already exists
    const existingStudent = await db.collection('students').findOne({ studentId });
    if (existingStudent) {
      return NextResponse.json(
        { error: 'Student ID already exists' },
        { status: 400 }
      );
    }

    const result = await db.collection('students').insertOne({
      name,
      grade,
      studentId,
      balance: 0,
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