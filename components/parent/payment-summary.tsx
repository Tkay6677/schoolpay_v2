"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, DollarSign } from 'lucide-react';
import { PaymentSummaryProps } from '@/lib/types/dashboard';

interface Student {
  id: string;
  name: string;
  grade: string;
  balance: number;
  lastPayment: string;
  status: string;
}

export function PaymentSummary({ students, payments }: PaymentSummaryProps) {
  const totalBalance = students.reduce((sum, student) => sum + student.balance, 0);
  const totalPending = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, payment) => sum + payment.amount, 0);
  const totalPaid = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Total Balance</p>
          <p className="text-2xl font-semibold">${totalBalance.toFixed(2)}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="text-2xl font-semibold">${totalPending.toFixed(2)}</p>
        </div>
      </div>
      <div className="p-4 border rounded-lg">
        <p className="text-sm text-muted-foreground">Total Paid (This Month)</p>
        <p className="text-2xl font-semibold">${totalPaid.toFixed(2)}</p>
      </div>
    </div>
  );
}