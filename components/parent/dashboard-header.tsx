"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface DashboardHeaderProps {
  username: string;
  students: Array<{
    _id: string;
    name: string;
    balance: number;
    grade?: string;
    status?: string;
  }>;
  payments: Array<{
    _id: string;
    student: string;
    amount: number;
    type: string;
    paymentCategory: string;
    description: string;
    date: string | Date;
    status: string;
  }>;
}

export function DashboardHeader({ username, students, payments }: DashboardHeaderProps) {
  const [showNotification, setShowNotification] = useState(true);
  const firstName = username.split(' ')[0];
  const currentDate = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  const formattedDate = currentDate.toLocaleDateString('en-US', options);

  // Low balance threshold
  const LOW_BALANCE_THRESHOLD = 2000;
  const lowBalanceStudents = students.filter(s => s.balance < LOW_BALANCE_THRESHOLD);

  // Pending payments (due soon or overdue)
  const pendingPayments = payments.filter(p => p.status === 'pending');

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {firstName}</h1>
          <p className="text-muted-foreground">{formattedDate}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/parent/payments/make">
            <Button className="gap-1">
              <Plus className="h-4 w-4" />
              Make Payment
            </Button>
          </Link>
        </div>
      </div>

      {showNotification && (
        <>
          {/* Low balance warnings */}
          {lowBalanceStudents.length > 0 && (
            <Card className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800 animate-in slide-in-from-top duration-300 mb-2">
              <CardContent className="flex items-center gap-3 p-4">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    <span className="font-medium">Low balance alert:</span> {lowBalanceStudents.map(s => s.name).join(', ')} {lowBalanceStudents.length === 1 ? 'has' : 'have'} a lunch balance below ₦{LOW_BALANCE_THRESHOLD.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotification(false)}
                  className="text-yellow-800 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/50"
                >
                  Dismiss
                </Button>
                <Link href="/parent/payments/make">
                  <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                    Top Up
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Pending payment reminders */}
          {pendingPayments.length > 0 && (
            <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 animate-in slide-in-from-top duration-300">
              <CardContent className="flex items-center gap-3 p-4">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    <span className="font-medium">Payment reminder:</span> {pendingPayments.map(p => {
                      const student = students.find(s => s._id === p.student);
                      return student ? `${p.paymentCategory.charAt(0).toUpperCase() + p.paymentCategory.slice(1)} payment for ${student.name} is due${p.date ? ` on ${new Date(p.date).toLocaleDateString()}` : ''}` : null;
                    }).filter(Boolean).join('; ')}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotification(false)}
                  className="text-blue-800 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50"
                >
                  Dismiss
                </Button>
                <Link href="/parent/payments/make">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Pay Now
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}