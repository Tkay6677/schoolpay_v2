import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { verifyAuth } from '@/lib/auth';

// GET payments
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

    // Get all students for the parent
    const students = await db.collection('students')
      .find({ parent: new ObjectId(user.id) })
      .toArray();

    const studentIds = students.map(student => student._id);

    // Get URL parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const studentId = searchParams.get('studentId');

    // Build query
    const query: any = { student: { $in: studentIds } };
    if (status) query.status = status;
    if (type) query.type = type;
    if (studentId) query.student = new ObjectId(studentId);

    const payments = await db.collection('payments')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST new payment
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
    const { studentId, amount, type, description, date } = body;

    if (!studentId || !amount || !type || !description || !date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Verify student belongs to parent
    const student = await db.collection('students').findOne({
      _id: new ObjectId(studentId),
      parent: new ObjectId(user.id)
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found or unauthorized' },
        { status: 404 }
      );
    }

    const result = await db.collection('payments').insertOne({
      student: new ObjectId(studentId),
      amount: parseFloat(amount),
      type,
      description,
      date: new Date(date),
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Update student balance
    await db.collection('students').updateOne(
      { _id: new ObjectId(studentId) },
      { 
        $inc: { balance: parseFloat(amount) },
        $set: { lastPayment: new Date() }
      }
    );

    return NextResponse.json(
      { message: 'Payment created successfully', paymentId: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update payment status
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
    const paymentId = searchParams.get('id');

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !['pending', 'completed', 'failed'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Get payment and verify student belongs to parent
    const payment = await db.collection('payments').findOne({
      _id: new ObjectId(paymentId)
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    const student = await db.collection('students').findOne({
      _id: payment.student,
      parent: new ObjectId(user.id)
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Update payment status
    const result = await db.collection('payments').updateOne(
      { _id: new ObjectId(paymentId) },
      {
        $set: {
          status,
          updatedAt: new Date()
        }
      }
    );

    // If payment is failed, reverse the balance update
    if (status === 'failed' && payment.status !== 'failed') {
      await db.collection('students').updateOne(
        { _id: payment.student },
        { $inc: { balance: -payment.amount } }
      );
    }

    return NextResponse.json(
      { message: 'Payment updated successfully', modifiedCount: result.modifiedCount }
    );
  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 