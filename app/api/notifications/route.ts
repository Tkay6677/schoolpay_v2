import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { NotificationService } from '@/lib/services/notification';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    const user = await verifyAuth(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const notifications = await NotificationService.getUserNotifications(
      user.id,
      limit,
      skip,
      unreadOnly
    );

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    const user = await verifyAuth(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, notificationId } = await request.json();

    switch (action) {
      case 'markAsRead':
        if (notificationId) {
          await NotificationService.markAsRead(notificationId);
        } else {
          await NotificationService.markAllAsRead(user.id);
        }
        break;
      case 'delete':
        if (notificationId) {
          await NotificationService.deleteNotification(notificationId);
        }
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 