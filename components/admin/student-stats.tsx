"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CircleDollarSign, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { useToast } from '@/hooks/use-toast';

interface StudentStatsProps {
  isLoading: boolean;
}

export function StudentStats({ isLoading }: StudentStatsProps) {
  const { token } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeToday: 0,
    totalBalance: 0,
    lowBalance: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const res = await fetch('/api/students', { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error('Failed to fetch student stats');
        const data = await res.json();
        const totalStudents = data.length;
        const today = new Date();
        const activeToday = data.filter((s: any) => {
          if (!s.lastPayment) return false;
          const lp = new Date(s.lastPayment);
          return lp.getDate() === today.getDate() && lp.getMonth() === today.getMonth() && lp.getFullYear() === today.getFullYear();
        }).length;
        const totalBalance = data.reduce((sum: number, s: any) => sum + (s.balance ?? 0), 0);
        const lowBalance = data.filter((s: any) => (s.balance ?? 0) < 1000).length;
        setStats({ totalStudents, activeToday, totalBalance, lowBalance });
      } catch (error: any) {
        console.error('Error fetching student stats:', error);
        toast({ title: 'Error loading student stats', description: error.message, variant: 'destructive' });
      } finally {
        setStatsLoading(false);
      }
    };
    if (token) {
      fetchStats();
    }
  }, [token, toast]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading || statsLoading ? (
            <div className="h-8 bg-muted animate-pulse rounded-md" />
          ) : (
            <>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeToday} active today
              </p>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading || statsLoading ? (
            <div className="h-8 bg-muted animate-pulse rounded-md" />
          ) : (
            <>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalBalance)}</div>
              <p className="text-xs text-muted-foreground">
                Across all student accounts
              </p>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Low Balance Alerts</CardTitle>
          <AlertTriangle className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          {isLoading || statsLoading ? (
            <div className="h-8 bg-muted animate-pulse rounded-md" />
          ) : (
            <>
              <div className="text-2xl font-bold">{stats.lowBalance}</div>
              <p className="text-xs text-muted-foreground">
                Students with balance under $5
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}