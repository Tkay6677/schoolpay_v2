"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, AlertCircle, Download } from 'lucide-react';
import Link from 'next/link';

interface AdminDashboardHeaderProps {
  username: string;
}

export function AdminDashboardHeader({ username }: AdminDashboardHeaderProps) {
  const [showNotification, setShowNotification] = useState(true);
  
  // Format first name
  const firstName = username.split(' ')[0];
  
  // Get current date
  const currentDate = new Date();
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  const formattedDate = currentDate.toLocaleDateString('en-US', options);
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {firstName}</h1>
          <p className="text-muted-foreground">{formattedDate}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-1">
            <Download className="h-4 w-4" />
            Export Reports
          </Button>
          <Link href="/admin/students/add">
            <Button className="gap-1">
              <Plus className="h-4 w-4" />
              Add Student
            </Button>
          </Link>
        </div>
      </div>
      
      {showNotification && (
        <Card className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 animate-in slide-in-from-top duration-300">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                <span className="font-medium">Attention:</span> 3 students have low balances and may not be eligible for lunch tomorrow.
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowNotification(false)}
              className="text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50"
            >
              Dismiss
            </Button>
            <Link href="/admin/lunch-eligibility">
              <Button 
                size="sm" 
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                View Details
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}