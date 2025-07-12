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
    // Verify parent authentication
    const token = request.headers.get('authorization')?.split(' ')[1];
    const user = await verifyAuth(token);
    if (!user || user.role !== 'parent') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message } = await request.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Verify the ticket belongs to this parent
    const ticket = await db.collection('support_tickets').findOne({
      _id: new ObjectId(params.id),
      parentId: new ObjectId(user.id)
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Add reply to the ticket
    const reply = {
      _id: new ObjectId(),
      message: message,
      from: 'parent',
      createdAt: new Date()
    };

    // Get current ticket and add reply to replies array
    const currentTicket = await db.collection('support_tickets').findOne({
      _id: new ObjectId(params.id)
    });

    if (!currentTicket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Initialize replies array if it doesn't exist
    const replies = currentTicket.replies || [];
    replies.push(reply);

    // Update the ticket with the new reply
    const result = await db.collection('support_tickets').updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: { 
          replies: replies,
          updatedAt: new Date(),
          status: 'open' // Reopen ticket when parent replies
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Send notification to all admins
    try {
      const admins = await db.collection('users')
        .find({ role: 'admin' })
        .project({ _id: 1 })
        .toArray();
      
      const adminIds = admins.map(admin => admin._id.toString());
      
      if (adminIds.length > 0) {
        await NotificationService.notifyParentReplied(
          adminIds,
          currentTicket.parentName || 'Parent',
          currentTicket.subject
        );
      }
    } catch (notificationError) {
      console.error('Error sending parent reply notification:', notificationError);
    }

    return NextResponse.json({ message: 'Reply sent successfully', replyId: reply._id });
  } catch (error) {
    console.error('Error adding reply:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 