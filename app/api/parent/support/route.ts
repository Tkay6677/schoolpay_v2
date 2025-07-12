import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { verifyAuth } from '@/lib/auth';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { NotificationService } from '@/lib/services/notification';

export const dynamic = 'force-dynamic';

const UPLOAD_DIR = join(process.cwd(), 'public', 'support-uploads');

// Ensure upload directory exists
try { mkdirSync(UPLOAD_DIR, { recursive: true }); } catch {}

export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    const user = await verifyAuth(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const client = await clientPromise;
    const db = client.db();
    const tickets = await db.collection('support_tickets')
      .find({ parentId: new ObjectId(user.id) })
      .sort({ createdAt: -1 })
      .toArray();
    // Add attachmentUrl if file exists
    const ticketsWithUrl = tickets.map(t => ({
      ...t,
      attachmentUrl: t.attachment ? `/support-uploads/${t.attachment}` : undefined,
    }));
    return NextResponse.json(ticketsWithUrl);
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    const user = await verifyAuth(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Parse multipart form data
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.startsWith('multipart/form-data')) {
      return NextResponse.json({ error: 'Content-Type must be multipart/form-data' }, { status: 400 });
    }
    // Use the web API to parse form data
    const formData = await request.formData();
    const subject = formData.get('subject');
    const message = formData.get('message');
    const priority = formData.get('priority') || 'medium';
    const file = formData.get('file');
    if (!subject || !message) {
      return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 });
    }
    let filename = undefined;
    if (file && typeof file === 'object' && typeof (file as any).arrayBuffer === 'function') {
      const buffer = new Uint8Array(await (file as any).arrayBuffer());
      const origName = (file as any).name || 'attachment';
      const ext = origName.includes('.') ? origName.split('.').pop() : '';
      filename = `${Date.now()}_${Math.random().toString(36).slice(2,8)}${ext ? '.' + ext : ''}`;
      writeFileSync(join(UPLOAD_DIR, filename), buffer);
    }
    const client = await clientPromise;
    const db = client.db();
    const ticket = {
      parentId: new ObjectId(user.id),
      subject: String(subject),
      message: String(message),
      priority: String(priority),
      attachment: filename,
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await db.collection('support_tickets').insertOne(ticket);
    
    // Send notification to all admins
    try {
      const admins = await db.collection('users')
        .find({ role: 'admin' })
        .project({ _id: 1 })
        .toArray();
      
      const adminIds = admins.map(admin => admin._id.toString());
      
      if (adminIds.length > 0) {
        await NotificationService.notifySupportTicketCreated(
          adminIds,
          user.name,
          String(subject)
        );
      }
    } catch (notificationError) {
      console.error('Error sending support ticket notification:', notificationError);
    }
    
    return NextResponse.json({ message: 'Support ticket submitted', ticketId: result.insertedId });
  } catch (error) {
    console.error('Error submitting support ticket:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 