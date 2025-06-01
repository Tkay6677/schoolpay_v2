"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface DashboardHeaderProps {
  username: string;
}

export function DashboardHeader({ username }: DashboardHeaderProps) {
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
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {firstName}</h1>
          <p className="text-muted-foreground">{formattedDate}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/parent/payments/make">
            <Button className="gap-1">
              <Plus className="h-4 w-4" />
              Make Payment
            </Button>
          </Link>
        </div>
      </div>
      
      {showNotification && (
        <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 animate-in slide-in-from-top duration-300">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <span className="font-medium">Payment reminder:</span> Weekly lunch payment for Alex is due on Monday.
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowNotification(false)}
              className="text-blue-800 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50"
            >
              Dismiss
            </Button>
            <Link href="/parent/payments/make">
              <Button 
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700"
              >
                Pay Now
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}