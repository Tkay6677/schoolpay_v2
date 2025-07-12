"use client";

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, CircleDollarSign } from 'lucide-react';
import { UpcomingPaymentsProps } from '@/lib/types/dashboard';

export function UpcomingPayments({ students, payments }: UpcomingPaymentsProps) {
  return (
    <div className="space-y-4">
      {payments.map((payment) => {
        const student = students.find(s => s._id === payment.student);
        if (!student) return null;

        return (
          <div
            key={payment._id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div>
              <h3 className="font-medium">{student.name}</h3>
              <p className="text-sm text-muted-foreground">{payment.description}</p>
            </div>
            <div className="text-right">
              <p className="font-medium">₦{payment.amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p className="text-sm text-muted-foreground">
                Due: {new Date(payment.date).toLocaleDateString()}
              </p>
            </div>
          </div>
        );
      })}
      {payments.length === 0 && (
        <p className="text-center text-muted-foreground py-4">
          No upcoming payments
        </p>
      )}
    </div>
  );
}