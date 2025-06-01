"use client";

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CircleDollarSign } from 'lucide-react';
import Link from 'next/link';
import { Student } from '@/lib/types/dashboard';

interface StudentListProps {
  students: Student[];
}

export function StudentList({ students }: StudentListProps) {
  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  // Format balance
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      {students.map((student) => (
        <div
          key={student._id}
          className="flex items-center justify-between p-4 border rounded-lg"
        >
          <div>
            <h3 className="font-medium">{student.name}</h3>
            <p className="text-sm text-muted-foreground">Grade {student.grade}</p>
          </div>
          <div className="text-right">
            <p className="font-medium">Balance: ${student.balance.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">
              {student.status === 'active' ? 'Active' : 'Inactive'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}