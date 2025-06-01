"use client";

import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, AlertTriangle, XCircle, Search } from 'lucide-react';
import Link from 'next/link';

interface Student {
  id: string;
  name: string;
  grade: string;
  paymentDate: string;
  balance: number;
  status: string;
}

interface LunchEligibilityListProps {
  students: Student[];
}

export function LunchEligibilityList({ students }: LunchEligibilityListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  
  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
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
  
  // Filter students based on search and status
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.grade.includes(searchTerm);
    const matchesStatus = selectedStatus === null || student.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });
  
  // Status badge rendering
  const renderStatus = (status: string) => {
    switch (status) {
      case 'eligible':
        return (
          <Badge className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Eligible
          </Badge>
        );
      case 'warning':
        return (
          <Badge className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Low Balance
          </Badge>
        );
      case 'ineligible':
        return (
          <Badge className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Ineligible
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
    <div>
      <div className="flex flex-col sm:flex-row justify-between mb-4 gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant={selectedStatus === null ? "default" : "outline"} 
            size="sm" 
            onClick={() => setSelectedStatus(null)}
          >
            All
          </Button>
          <Button 
            variant={selectedStatus === 'eligible' ? "default" : "outline"} 
            size="sm" 
            onClick={() => setSelectedStatus('eligible')}
            className={selectedStatus === 'eligible' ? "" : "text-green-700 dark:text-green-400"}
          >
            Eligible
          </Button>
          <Button 
            variant={selectedStatus === 'warning' ? "default" : "outline"} 
            size="sm" 
            onClick={() => setSelectedStatus('warning')}
            className={selectedStatus === 'warning' ? "" : "text-amber-700 dark:text-amber-400"}
          >
            Low Balance
          </Button>
          <Button 
            variant={selectedStatus === 'ineligible' ? "default" : "outline"} 
            size="sm" 
            onClick={() => setSelectedStatus('ineligible')}
            className={selectedStatus === 'ineligible' ? "" : "text-red-700 dark:text-red-400"}
          >
            Ineligible
          </Button>
        </div>
      </div>
      
      {filteredStudents.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No students match your filters</p>
        </div>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left p-3 font-medium">Student</th>
                <th className="text-left p-3 font-medium">Grade</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">Last Payment</th>
                <th className="text-left p-3 font-medium hidden lg:table-cell">Balance</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-right p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id} className="border-t">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border">
                        <AvatarFallback className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-xs">
                          {getInitials(student.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{student.name}</span>
                    </div>
                  </td>
                  <td className="p-3">{student.grade}</td>
                  <td className="p-3 hidden md:table-cell">{formatDate(student.paymentDate)}</td>
                  <td className="p-3 hidden lg:table-cell">{formatCurrency(student.balance)}</td>
                  <td className="p-3">{renderStatus(student.status)}</td>
                  <td className="p-3 text-right">
                    <Link href={`/admin/students/${student.id}`}>
                      <Button variant="ghost" size="sm">Details</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}