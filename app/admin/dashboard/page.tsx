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
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  
  // Mock data for eligibility list
  const [eligibleStudents, setEligibleStudents] = useState([
    { id: '1', name: 'Alex Johnson', grade: '5', paymentDate: '2023-09-01', balance: 45.00, status: 'eligible' },
    { id: '2', name: 'Sarah Johnson', grade: '3', paymentDate: '2023-09-05', balance: 15.50, status: 'eligible' },
    { id: '3', name: 'Michael Davis', grade: '4', paymentDate: '2023-09-03', balance: 5.00, status: 'warning' },
    { id: '4', name: 'Emily Wilson', grade: '2', paymentDate: '2023-08-28', balance: 0, status: 'ineligible' },
    { id: '5', name: 'Daniel Martinez', grade: '6', paymentDate: '2023-09-07', balance: 32.50, status: 'eligible' },
  ]);
  
  // Mock recent payments
  const [recentPayments, setRecentPayments] = useState([
    { id: '1', date: '2023-09-07', amount: 25.00, type: 'Weekly', student: 'Daniel Martinez', parent: 'Sofia Martinez', status: 'completed' },
    { id: '2', date: '2023-09-05', amount: 25.00, type: 'Weekly', student: 'Sarah Johnson', parent: 'Robert Johnson', status: 'completed' },
    { id: '3', date: '2023-09-03', amount: 5.00, type: 'Daily', student: 'Michael Davis', parent: 'Jennifer Davis', status: 'completed' },
    { id: '4', date: '2023-09-01', amount: 85.00, type: 'Monthly', student: 'Alex Johnson', parent: 'Robert Johnson', status: 'completed' },
  ]);
  
  useEffect(() => {
    // Simulate API loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
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
            <LunchEligibilityList students={eligibleStudents} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}