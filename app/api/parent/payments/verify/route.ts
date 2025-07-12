import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { NotificationService } from '@/lib/services/notification';

// Mark this route as dynamic
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Parse URL parameters more safely
    const url = new URL(request.url);
    const transactionId = url.searchParams.get('transaction_id');
    const status = url.searchParams.get('status');
    const tx_ref = url.searchParams.get('tx_ref');

    if (!transactionId || !status || !tx_ref) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Verify payment with Flutterwave
    const response = await fetch(
      `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        },
      }
    );

    const flutterwaveData = await response.json();

    if (!response.ok || flutterwaveData.status !== 'success') {
      throw new Error(flutterwaveData.message || 'Payment verification failed');
    }

    const client = await clientPromise;
    const db = client.db();

    // Update payment status
    const payment = await db.collection('payments').findOne({
      _id: new ObjectId(tx_ref)
    });

    if (!payment) {
      throw new Error('Payment record not found');
    }

    // Verify payment amount matches
    if (flutterwaveData.data.amount !== payment.amount) {
      throw new Error('Payment amount mismatch');
    }

    // Update payment status
    await db.collection('payments').updateOne(
      { _id: new ObjectId(tx_ref) },
      {
        $set: {
          status: 'completed',
          transactionId,
          flutterwaveResponse: flutterwaveData.data,
          updatedAt: new Date(),
        },
      }
    );

    // Update student balance
    await db.collection('students').updateOne(
      { _id: payment.student },
      {
        $inc: { balance: payment.amount },
        $set: { lastPayment: new Date() },
      }
    );

    // Send success notification
    try {
      const student = await db.collection('students').findOne({ _id: payment.student });
      if (student && payment.parentId) {
        await NotificationService.notifyPaymentSuccess(
          payment.parentId.toString(),
          payment.amount,
          student.name
        );
      }
    } catch (notificationError) {
      console.error('Error sending payment success notification:', notificationError);
    }

    // Use absolute URLs for redirects
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const successUrl = new URL(`/parent/payments/success`, baseUrl);
    successUrl.searchParams.set('paymentId', tx_ref);

    return NextResponse.redirect(successUrl);

  } catch (error) {
    console.error('Error verifying payment:', error);
    
    // Send failure notification if we have payment details
    try {
      const url = new URL(request.url);
      const tx_ref = url.searchParams.get('tx_ref');
      
      if (tx_ref) {
        const client = await clientPromise;
        const db = client.db();
        
        const payment = await db.collection('payments').findOne({
          _id: new ObjectId(tx_ref)
        });
        
        if (payment && payment.parentId) {
          const student = await db.collection('students').findOne({ _id: payment.student });
          await NotificationService.notifyPaymentFailed(
            payment.parentId.toString(),
            payment.amount,
            student?.name || 'Student',
            error instanceof Error ? error.message : 'Payment verification failed'
          );
        }
      }
    } catch (notificationError) {
      console.error('Error sending payment failure notification:', notificationError);
    }
    
    // Use absolute URLs for redirects
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const errorUrl = new URL('/parent/payments/error', baseUrl);
    errorUrl.searchParams.set('message', error instanceof Error ? error.message : 'Payment verification failed');

    return NextResponse.redirect(errorUrl);
  }
} 