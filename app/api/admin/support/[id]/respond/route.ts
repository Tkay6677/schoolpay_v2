import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { verifyAuth } from '@/lib/auth';
import { NotificationService } from '@/lib/services/notification';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const token = request.headers.get('authorization')?.split(' ')[1];
    const user = await verifyAuth(token);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { response } = await request.json();
    if (!response || typeof response !== 'string') {
      return NextResponse.json({ error: 'Response message is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Get current ticket and add admin response to replies array
    const currentTicket = await db.collection('support_tickets').findOne({
      _id: new ObjectId(params.id)
    });

    if (!currentTicket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Create admin reply
    const adminReply = {
      _id: new ObjectId(),
      message: response,
      from: 'admin',
      createdAt: new Date()
    };

    // Initialize replies array if it doesn't exist
    const replies = currentTicket.replies || [];
    replies.push(adminReply);

    // Prepare update object
    const updateData: any = {
      replies: replies,
      updatedAt: new Date(),
      status: 'in_progress' // Update status to in progress when admin responds
    };

    // If this is the first admin response, also set adminResponse field
    if (!currentTicket.adminResponse) {
      updateData.adminResponse = response;
      updateData.adminResponseDate = new Date();
    }

    // Update the ticket with admin response and reply
    const result = await db.collection('support_tickets').updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: updateData
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Send notification to parent
    try {
      await NotificationService.notifySupportTicketResponded(
        currentTicket.parentId.toString(),
        currentTicket.subject
      );
    } catch (notificationError) {
      console.error('Error sending support response notification:', notificationError);
    }

    return NextResponse.json({ message: 'Response sent successfully' });
  } catch (error) {
    console.error('Error responding to ticket:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 