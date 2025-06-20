"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminDashboardHeader } from '@/components/admin/dashboard-header';
import { StudentList } from '@/components/parent/student-list';

export default function AdminStudentsPage() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch('/api/students', { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error('Failed to fetch students');
        const data = await res.json();
        setStudents(data);
      } catch (error: any) {
        toast({ title: 'Error loading students', description: error.message, variant: 'destructive' });
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
      <AdminDashboardHeader username={user.name} />
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Manage Students</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-40 bg-muted animate-pulse rounded-md" />
          ) : (
            <StudentList students={students} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
