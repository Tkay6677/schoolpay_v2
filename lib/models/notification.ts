import { ObjectId } from 'mongodb';

export interface Notification {
  _id?: ObjectId;
  recipientId: ObjectId; // User ID (parent or admin)
  recipientType: 'parent' | 'admin';
  type: 'payment' | 'support' | 'student' | 'lunch' | 'system';
  title: string;
  message: string;
  relatedEntity?: {
    type: 'payment' | 'support_ticket' | 'student' | 'lunch_order';
    id: ObjectId;
  };
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

export const NOTIFICATION_TYPES = {
  // Payment notifications
  PAYMENT_SUCCESS: 'payment_success',
  PAYMENT_FAILED: 'payment_failed',
  PAYMENT_PENDING: 'payment_pending',
  LOW_BALANCE: 'low_balance',
  PAYMENT_DUE: 'payment_due',
  
  // Support notifications
  SUPPORT_TICKET_CREATED: 'support_ticket_created',
  SUPPORT_TICKET_RESPONDED: 'support_ticket_responded',
  SUPPORT_TICKET_UPDATED: 'support_ticket_updated',
  
  // Student notifications
  STUDENT_ADDED: 'student_added',
  STUDENT_UPDATED: 'student_updated',
  STUDENT_BALANCE_UPDATED: 'student_balance_updated',
  
  // Lunch notifications
  LUNCH_SERVED: 'lunch_served',
  LUNCH_ELIGIBILITY_CHANGED: 'lunch_eligibility_changed',
  
  // System notifications
  SYSTEM_MAINTENANCE: 'system_maintenance',
  SYSTEM_UPDATE: 'system_update'
} as const;

export const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
} as const; 