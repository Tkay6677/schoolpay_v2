"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { AdminDashboardHeader } from '@/components/admin/dashboard-header';
import { LunchEligibilityList } from '@/components/admin/lunch-eligibility-list';
import { RecentPaymentsAdmin } from '@/components/admin/recent-payments';
import { StudentStats } from '@/components/admin/student-stats';
import { PaymentChart } from '@/components/admin/payment-chart';

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  
  const [eligibleStudents, setEligibleStudents] = useState<any[]>([]);
  
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [studentsRes, paymentsRes] = await Promise.all([
          fetch('/api/students', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/parent/payments', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (!studentsRes.ok) throw new Error('Failed to fetch students');
        if (!paymentsRes.ok) throw new Error('Failed to fetch payments');
        const studentsData = await studentsRes.json();
        const paymentsData = await paymentsRes.json();
        setEligibleStudents(
          studentsData.map((s: any) => ({
            id: s._id,
            name: s.name,
            grade: s.grade,
            paymentDate: s.lastPayment || s.updatedAt,
            balance: s.balance,
            status: s.balance >= 1000 ? 'eligible' : s.balance > 0 ? 'warning' : 'ineligible',
          }))
        );
        setRecentPayments(
          paymentsData.map((p: any) => ({
            id: p._id,
            date: p.date,
            amount: p.amount,
            type: p.type,
            student: '',
            parent: '',
            status: p.status,
          }))
        );
      } catch (error: any) {
        toast({ title: 'Error loading dashboard', description: error.message, variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };
    if (token) {
      fetchData();
    }
  }, [token]);
  
  if (!user || user.role !== 'admin') {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Access Denied</CardTitle>
            <CardDescription>
              You need administrator access to view this page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login" className="w-full">
              <Button className="w-full">Login as Administrator</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container py-6 space-y-6 animate-in fade-in duration-500">
      <AdminDashboardHeader username={user.name} />
      
      <div className="grid gap-6 md:grid-cols-3">
        <StudentStats isLoading={isLoading} />
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Payment Trends</CardTitle>
            <CardDescription>
              Monthly payment data
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-80 bg-muted animate-pulse rounded-md" />
            ) : (
              <PaymentChart />
            )}
          </CardContent>
        </Card>
        
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Recent Payments</CardTitle>
            <CardDescription>
              Latest transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-12 bg-muted animate-pulse rounded-md" />
                <div className="h-12 bg-muted animate-pulse rounded-md" />
                <div className="h-12 bg-muted animate-pulse rounded-md" />
              </div>
            ) : (
              <RecentPaymentsAdmin payments={recentPayments} />
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Today's Lunch Eligibility</CardTitle>
          <CardDescription>
            Students eligible for lunch today
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <div className="h-12 bg-muted animate-pulse rounded-md" />
              <div className="h-12 bg-muted animate-pulse rounded-md" />
              <div className="h-12 bg-muted animate-pulse rounded-md" />
            </div>
          ) : (
            <LunchEligibilityList
  students={eligibleStudents}
  onServe={(id, rate) => {
    fetch('/api/admin/students/serve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ studentId: id, dailyRate: rate }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Serve failed');
        toast({ title: 'Lunch served', description: 'Balance deducted' });
        setEligibleStudents(prev => prev.filter(s => s.id !== id));
      })
      .catch(err => toast({ title: 'Error', description: err.message, variant: 'destructive' }));
  }}
/>
          )}
        </CardContent>
      </Card>
    </div>
  );
}