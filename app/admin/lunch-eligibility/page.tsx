"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { AdminDashboardHeader } from '@/components/admin/dashboard-header';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { LunchEligibilityList } from '@/components/admin/lunch-eligibility-list';
import { Button } from '@/components/ui/button';

export default function AdminLunchEligibilityPage() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const DAILY_RATE = 1000; // daily lunch rate in NGN
  const handleServe = async (studentId: string, dailyRate: number) => {
    try {
      const res = await fetch('/api/admin/students/serve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ studentId, dailyRate }),
      });
      if (!res.ok) throw new Error('Failed to serve lunch');
      toast({ title: 'Lunch served', description: 'Balance deducted' });
      setStudents(prev => prev.filter(s => s.id !== studentId));
    } catch (error: any) {
      toast({ title: 'Error serving lunch', description: error.message, variant: 'destructive' });
    }
  };

  const handleServeAll = async () => {
    const eligible = students.filter(s => s.status === 'eligible');
    if (eligible.length === 0) {
      toast({ title: 'No eligible students', description: 'No students to serve', variant: 'destructive' });
      return;
    }
    try {
      await Promise.all(
        eligible.map(s =>
          fetch('/api/admin/students/serve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ studentId: s.id, dailyRate: s.dailyRate }),
          })
        )
      );
      toast({ title: 'All eligible students served', description: 'Balances deducted' });
      setStudents(prev => prev.filter(s => s.status !== 'eligible'));
    } catch (error: any) {
      toast({ title: 'Error serving all', description: error.message, variant: 'destructive' });
    }
  };

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch('/api/students', { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error('Failed to fetch students');
        const data = await res.json();
        const list = data.map((s: any) => ({
          id: s._id,
          name: s.name,
          grade: s.grade,
          paymentDate: s.lastPayment || s.updatedAt,
          balance: s.balance,
          status: s.balance >= DAILY_RATE ? 'eligible' : s.balance > 0 ? 'warning' : 'ineligible',
          dailyRate: DAILY_RATE,
        }));
        setStudents(list);
      } catch (error: any) {
        toast({ title: 'Error loading eligibility list', description: error.message, variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };
    if (token) fetchStudents();
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
      {/* <AdminDashboardHeader username={user.name} /> */}
      <Card>
        <CardHeader>
          <CardTitle>Lunch Eligibility</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4 gap-2">
            <Button onClick={() => window.print()}>Print List</Button>
            <Button variant="outline" onClick={() => handleServeAll()}>Serve All</Button>
          </div>
          {isLoading ? (
            <div className="space-y-2">
              <div className="h-8 bg-muted animate-pulse rounded-md" />
              <div className="h-8 bg-muted animate-pulse rounded-md" />
              <div className="h-8 bg-muted animate-pulse rounded-md" />
            </div>
          ) : (
            <LunchEligibilityList students={students} onServe={handleServe} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
