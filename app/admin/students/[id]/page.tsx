"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function AdminStudentDetailPage() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [student, setStudent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await fetch('/api/students', { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error('Failed to fetch students');
        const data = await res.json();
        const s = data.find((st: any) => st._id === id);
        if (!s) throw new Error('Student not found');
        setStudent(s);
      } catch (error: any) {
        toast({ title: 'Error loading student', description: error.message, variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };
    if (token && id) fetchStudent();
  }, [token, id, toast]);

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
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Student Details</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <div className="h-6 bg-muted animate-pulse rounded-md" />
              <div className="h-6 bg-muted animate-pulse rounded-md" />
              <div className="h-6 bg-muted animate-pulse rounded-md" />
            </div>
          ) : student ? (
            <div className="space-y-4">
              <p><strong>Name:</strong> {student.name}</p>
              <p><strong>Grade:</strong> {student.grade}</p>
              <p><strong>Admission Number:</strong> {student.admissionNumber}</p>
              <p><strong>Balance:</strong> ₦{student.balance}</p>
              <p><strong>Last Payment:</strong> {student.lastPayment ? new Date(student.lastPayment).toLocaleString() : 'N/A'}</p>
              <p><strong>Dietary Preferences:</strong> {student.dietaryPreferences?.join(', ') || 'None'}</p>
              <p><strong>Allergies:</strong> {student.allergies?.join(', ') || 'None'}</p>
              <p><strong>Other Allergies:</strong> {student.otherAllergies || 'None'}</p>
              <p><strong>Additional Notes:</strong> {student.additionalNotes || 'None'}</p>
            </div>
          ) : (
            <p className="text-center text-muted-foreground">Student not found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
