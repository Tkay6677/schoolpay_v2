"use client";

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CircleDollarSign, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import Link from 'next/link';

interface Payment {
  id: string;
  date: string;
  amount: number;
  type: string;
  student: string;
  parent: string;
  status: string;
}

interface RecentPaymentsAdminProps {
  payments: Payment[];
}

export function RecentPaymentsAdmin({ payments }: RecentPaymentsAdminProps) {
  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Status badge rendering
  const renderStatus = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
            Completed
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800">
            Pending
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-4">
      {payments.length === 0 ? (
        <div className="text-center py-8">
          <CircleDollarSign className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
          <p className="mt-2 text-muted-foreground">No recent payments</p>
        </div>
      ) : (
        <div className="space-y-2">
          {payments.map((payment) => (
            <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 h-9 w-9 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <CircleDollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium">{payment.student}</p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span>{formatDate(payment.date)}</span>
                    <span className="mx-1">•</span>
                    <span>{payment.parent}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatCurrency(payment.amount)}</p>
                <div className="mt-1">
                  {renderStatus(payment.status)}
                </div>
              </div>
            </div>
          ))}
          
          <Link href="/admin/payments" className="block">
            <Button variant="outline" className="w-full mt-2">View All Payments</Button>
          </Link>
        </div>
      )}
    </div>
  );
}