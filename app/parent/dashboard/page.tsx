"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardHeader } from '@/components/parent/dashboard-header';
import { PaymentSummary } from '@/components/parent/payment-summary';
import { StudentList } from '@/components/parent/student-list';
import { QuickPayment } from '@/components/parent/quick-payment';
import { UpcomingPayments } from '@/components/parent/upcoming-payments';
import { RecentTransactions } from '@/components/parent/recent-transactions';
import { PaymentRates } from '@/components/parent/payment-rates';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, 
  CreditCard, 
  PieChart, 
  CalendarClock, 
  History,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import type { Student, Payment, QuickPaymentData } from '@/lib/types/dashboard';

export default function ParentDashboard() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    if (user && token) {
      fetchDashboardData();
    }
  }, [user, token]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch students
      const studentsRes = await fetch('/api/parent/students', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const studentsData = await studentsRes.json();
      
      if (!studentsRes.ok) throw new Error(studentsData.error);
      setStudents(studentsData);

      // Fetch payments
      const paymentsRes = await fetch('/api/parent/payments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const paymentsData = await paymentsRes.json();
      
      if (!paymentsRes.ok) throw new Error(paymentsData.error);
      setPayments(paymentsData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async (paymentData: QuickPaymentData) => {
    try {
      const res = await fetch('/api/parent/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(paymentData)
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);

      toast({
        title: "Success",
        description: "Payment initiated successfully.",
      });

      // Refresh dashboard data
      fetchDashboardData();

    } catch (error) {
      console.error('Error making payment:', error);
      toast({
        title: "Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Access Denied</CardTitle>
            <CardDescription>
              You need to be logged in to access this page
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/login" className="w-full">
              <Button className="w-full">Login</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <DashboardHeader username={user.name} students={students} payments={payments} />
      
      <div className="container py-6 animate-in fade-in duration-500">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          {/* Left Sidebar - Students and Quick Payment */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <CardTitle className="text-xl">My Students</CardTitle>
                </div>
                <CardDescription>
                  {students.length} students linked to your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    <div className="h-12 bg-muted animate-pulse rounded-md" />
                    <div className="h-12 bg-muted animate-pulse rounded-md" />
                  </div>
                ) : (
                  <ScrollArea className="h-[300px] pr-4">
                    <StudentList students={students} />
                  </ScrollArea>
                )}
              </CardContent>
              <CardFooter>
                <Link href="/parent/students" className="w-full">
                  <Button variant="outline" className="w-full">
                    Manage Students
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card className="border-none shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <CardTitle className="text-xl">Quick Payment</CardTitle>
                </div>
                <CardDescription>
                  Make a quick payment for your student
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    <div className="h-20 bg-muted animate-pulse rounded-md" />
                    <div className="h-12 bg-muted animate-pulse rounded-md" />
                  </div>
                ) : (
                  <QuickPayment students={students} onSubmit={handlePayment} />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-5 space-y-6">
            {/* Payment Summary Card */}
            <Card className="border-none shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  <CardTitle className="text-xl">Payment Summary</CardTitle>
                </div>
                <CardDescription>
                  Current month overview
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-48 bg-muted animate-pulse rounded-md" />
                ) : (
                  <PaymentSummary students={students} payments={payments} />
                )}
              </CardContent>
            </Card>

            {/* Payments Tabs */}
            <Card className="border-none shadow-md">
              <Tabs defaultValue="upcoming" className="w-full">
                <CardHeader className="pb-2">
                  <TabsList className="grid w-full grid-cols-2 h-11">
                    <TabsTrigger value="upcoming" className="flex items-center gap-2">
                      <CalendarClock className="h-4 w-4" />
                      Upcoming Payments
                    </TabsTrigger>
                    <TabsTrigger value="history" className="flex items-center gap-2">
                      <History className="h-4 w-4" />
                      Payment History
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>
                <CardContent className="pt-0">
                  <TabsContent value="upcoming" className="mt-0">
                    {isLoading ? (
                      <div className="h-48 bg-muted animate-pulse rounded-md" />
                    ) : (
                      <UpcomingPayments students={students} payments={payments} />
                    )}
                  </TabsContent>
                  <TabsContent value="history" className="mt-0">
                    {isLoading ? (
                      <div className="h-48 bg-muted animate-pulse rounded-md" />
                    ) : (
                      <RecentTransactions transactions={payments} />
                    )}
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>

            {/* Payment Rates Section */}
            {students.length > 0 && (
              <div className="space-y-6">
                {students.map((student) => (
                  <PaymentRates key={student._id} student={student} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}