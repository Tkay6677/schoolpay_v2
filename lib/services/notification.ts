import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { Notification, NOTIFICATION_TYPES, NOTIFICATION_PRIORITIES } from '@/lib/models/notification';

export class NotificationService {
  private static async getDb() {
    const client = await clientPromise;
    return client.db();
  }

  // Create a new notification
  static async createNotification(notification: Omit<Notification, '_id' | 'createdAt' | 'updatedAt'>): Promise<ObjectId> {
    const db = await this.getDb();
    const result = await db.collection('notifications').insertOne({
      ...notification,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return result.insertedId;
  }

  // Create multiple notifications (for bulk operations)
  static async createMultipleNotifications(notifications: Omit<Notification, '_id' | 'createdAt' | 'updatedAt'>[]): Promise<ObjectId[]> {
    const db = await this.getDb();
    const notificationsWithTimestamps = notifications.map(notification => ({
      ...notification,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    const result = await db.collection('notifications').insertMany(notificationsWithTimestamps);
    return Object.values(result.insertedIds);
  }

  // Get notifications for a user
  static async getUserNotifications(
    userId: string, 
    limit: number = 50, 
    skip: number = 0,
    unreadOnly: boolean = false
  ): Promise<Notification[]> {
    const db = await this.getDb();
    const filter: any = { recipientId: new ObjectId(userId) };
    if (unreadOnly) {
      filter.isRead = false;
    }
    
    return await db.collection('notifications')
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray() as Notification[];
  }

  // Get unread notification count
  static async getUnreadCount(userId: string): Promise<number> {
    const db = await this.getDb();
    return await db.collection('notifications').countDocuments({
      recipientId: new ObjectId(userId),
      isRead: false
    });
  }

  // Mark notification as read
  static async markAsRead(notificationId: string): Promise<void> {
    const db = await this.getDb();
    await db.collection('notifications').updateOne(
      { _id: new ObjectId(notificationId) },
      { $set: { isRead: true, updatedAt: new Date() } }
    );
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(userId: string): Promise<void> {
    const db = await this.getDb();
    await db.collection('notifications').updateMany(
      { recipientId: new ObjectId(userId), isRead: false },
      { $set: { isRead: true, updatedAt: new Date() } }
    );
  }

  // Delete notification
  static async deleteNotification(notificationId: string): Promise<void> {
    const db = await this.getDb();
    await db.collection('notifications').deleteOne({ _id: new ObjectId(notificationId) });
  }

  // Delete old notifications (cleanup)
  static async deleteOldNotifications(daysOld: number = 30): Promise<number> {
    const db = await this.getDb();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const result = await db.collection('notifications').deleteMany({
      createdAt: { $lt: cutoffDate },
      isRead: true
    });
    return result.deletedCount;
  }

  // Notification creation helpers for specific events
  static async notifyPaymentSuccess(parentId: string, amount: number, studentName: string): Promise<void> {
    await this.createNotification({
      recipientId: new ObjectId(parentId),
      recipientType: 'parent',
      type: 'payment',
      title: 'Payment Successful',
      message: `Your payment of ₦${amount.toLocaleString()} for ${studentName} has been processed successfully.`,
      priority: NOTIFICATION_PRIORITIES.MEDIUM,
      isRead: false
    });
  }

  static async notifyPaymentFailed(parentId: string, amount: number, studentName: string, reason?: string): Promise<void> {
    await this.createNotification({
      recipientId: new ObjectId(parentId),
      recipientType: 'parent',
      type: 'payment',
      title: 'Payment Failed',
      message: `Your payment of ₦${amount.toLocaleString()} for ${studentName} failed. ${reason ? `Reason: ${reason}` : ''}`,
      priority: NOTIFICATION_PRIORITIES.HIGH,
      isRead: false
    });
  }

  static async notifyLowBalance(parentId: string, studentName: string, balance: number): Promise<void> {
    await this.createNotification({
      recipientId: new ObjectId(parentId),
      recipientType: 'parent',
      type: 'payment',
      title: 'Low Balance Alert',
      message: `${studentName} has a low balance of ₦${balance.toLocaleString()}. Please top up to avoid service interruption.`,
      priority: NOTIFICATION_PRIORITIES.HIGH,
      isRead: false
    });
  }

  static async notifySupportTicketCreated(adminIds: string[], parentName: string, subject: string): Promise<void> {
    const notifications = adminIds.map(adminId => ({
      recipientId: new ObjectId(adminId),
      recipientType: 'admin' as const,
      type: 'support' as const,
      title: 'New Support Ticket',
      message: `${parentName} has submitted a new support ticket: "${subject}"`,
      priority: NOTIFICATION_PRIORITIES.MEDIUM,
      isRead: false
    }));
    await this.createMultipleNotifications(notifications);
  }

  static async notifySupportTicketResponded(parentId: string, subject: string): Promise<void> {
    await this.createNotification({
      recipientId: new ObjectId(parentId),
      recipientType: 'parent',
      type: 'support',
      title: 'Support Ticket Updated',
      message: `An admin has responded to your support ticket: "${subject}"`,
      priority: NOTIFICATION_PRIORITIES.MEDIUM,
      isRead: false
    });
  }

  static async notifyParentReplied(adminIds: string[], parentName: string, subject: string): Promise<void> {
    const notifications = adminIds.map(adminId => ({
      recipientId: new ObjectId(adminId),
      recipientType: 'admin' as const,
      type: 'support' as const,
      title: 'Parent Replied',
      message: `${parentName} has replied to support ticket: "${subject}"`,
      priority: NOTIFICATION_PRIORITIES.MEDIUM,
      isRead: false
    }));
    await this.createMultipleNotifications(notifications);
  }

  static async notifyLunchServed(parentId: string, studentName: string, amount: number): Promise<void> {
    await this.createNotification({
      recipientId: new ObjectId(parentId),
      recipientType: 'parent',
      type: 'lunch',
      title: 'Lunch Served',
      message: `Lunch has been served to ${studentName}. ₦${amount.toLocaleString()} has been deducted from the balance.`,
      priority: NOTIFICATION_PRIORITIES.LOW,
      isRead: false
    });
  }

  static async notifyStudentAdded(parentId: string, studentName: string): Promise<void> {
    await this.createNotification({
      recipientId: new ObjectId(parentId),
      recipientType: 'parent',
      type: 'student',
      title: 'Student Added',
      message: `${studentName} has been successfully added to your account.`,
      priority: NOTIFICATION_PRIORITIES.MEDIUM,
      isRead: false
    });
  }

  static async notifyStudentBalanceUpdated(parentId: string, studentName: string, newBalance: number): Promise<void> {
    await this.createNotification({
      recipientId: new ObjectId(parentId),
      recipientType: 'parent',
      type: 'student',
      title: 'Balance Updated',
      message: `${studentName}'s balance has been updated to ₦${newBalance.toLocaleString()}.`,
      priority: NOTIFICATION_PRIORITIES.LOW,
      isRead: false
    });
  }

  // Check and notify about low balances
  static async checkAndNotifyLowBalances(): Promise<void> {
    const db = await this.getDb();
    const LOW_BALANCE_THRESHOLD = 2000; // ₦2,000

    // Find students with low balance
    const studentsWithLowBalance = await db.collection('students')
      .find({ 
        balance: { $lt: LOW_BALANCE_THRESHOLD },
        parentId: { $exists: true, $ne: null }
      })
      .toArray();

    for (const student of studentsWithLowBalance) {
      try {
        await this.notifyLowBalance(
          student.parentId.toString(),
          student.name,
          student.balance
        );
      } catch (error) {
        console.error(`Error notifying low balance for student ${student.name}:`, error);
      }
    }
  }

  // Notify about payment due dates
  static async notifyPaymentDue(parentId: string, studentName: string, dueDate: Date, amount: number): Promise<void> {
    await this.createNotification({
      recipientId: new ObjectId(parentId),
      recipientType: 'parent',
      type: 'payment',
      title: 'Payment Due',
      message: `Payment of ₦${amount.toLocaleString()} for ${studentName} is due on ${dueDate.toLocaleDateString()}.`,
      priority: NOTIFICATION_PRIORITIES.HIGH,
      isRead: false
    });
  }
} 