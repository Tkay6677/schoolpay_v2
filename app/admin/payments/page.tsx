"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { AdminDashboardHeader } from '@/components/admin/dashboard-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RecentPaymentsAdmin } from '@/components/admin/recent-payments';

export default function AdminPaymentsPage() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await fetch('/api/parent/payments', { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error('Failed to fetch payments');
        const data = await res.json();
        setPayments(data);
      } catch (error: any) {
        toast({ title: 'Error loading payments', description: error.message, variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };
    if (token) fetchPayments();
  }, [token, toast]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Access Denied</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6 animate-in fade-in duration-500">
      <AdminDashboardHeader username={user.name} />
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">All Payments</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <div className="h-12 bg-muted animate-pulse rounded-md" />
              <div className="h-12 bg-muted animate-pulse rounded-md" />
              <div className="h-12 bg-muted animate-pulse rounded-md" />
            </div>
          ) : (
            <RecentPaymentsAdmin payments={payments} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
