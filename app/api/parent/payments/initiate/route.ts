import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { verifyAuth } from '@/lib/auth';

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
    const { studentId, amount, type, paymentCategory, description } = body;

    if (!studentId || !amount || !type || !paymentCategory) {
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

    // Create a pending payment record
    const payment = await db.collection('payments').insertOne({
      student: new ObjectId(studentId),
      amount: parseFloat(amount),
      type,
      paymentCategory,
      description: description || `${type} payment for ${student.name}`,
      date: new Date(),
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Initialize Flutterwave payment
    const response = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tx_ref: payment.insertedId.toString(),
        amount: amount,
        currency: 'NGN',
        payment_options: 'card,banktransfer',
        redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/parent/payments/verify`,
        customer: {
          email: user.email,
          name: user.name,
          ...(user.phone && { phonenumber: user.phone })
        },
        customizations: {
          title: 'School Payment',
          description: `Payment for ${student.name}`,
          logo: 'https://your-school-logo-url.com/logo.png',
        },
        meta: {
          paymentId: payment.insertedId.toString(),
          studentId: studentId,
          studentName: student.name,
          paymentType: type,
        },
      }),
    });

    const flutterwaveData = await response.json();

    if (!response.ok) {
      // If Flutterwave initialization fails, update payment status
      await db.collection('payments').updateOne(
        { _id: payment.insertedId },
        { 
          $set: { 
            status: 'failed',
            error: flutterwaveData.message,
            updatedAt: new Date()
          } 
        }
      );

      throw new Error(flutterwaveData.message);
    }

    // Update payment with Flutterwave reference
    await db.collection('payments').updateOne(
      { _id: payment.insertedId },
      { 
        $set: { 
          flwRef: flutterwaveData.data.flw_ref,
          paymentLink: flutterwaveData.data.link,
          updatedAt: new Date()
        } 
      }
    );

    return NextResponse.json({
      message: 'Payment initiated successfully',
      paymentId: payment.insertedId,
      paymentLink: flutterwaveData.data.link,
    });

  } catch (error) {
    console.error('Error initiating payment:', error);
    return NextResponse.json(
      { error: 'Failed to initiate payment' },
      { status: 500 }
    );
  }
} 