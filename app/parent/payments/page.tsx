"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Plus, History, AlertCircle, CheckCircle, ArrowRight, CircleDollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function PaymentsOverviewPage() {
  const { user, token } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      if (!user || !token) return;
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/parent/payments", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setPayments(data);
      } catch (err: any) {
        setError(err.message || "Failed to load payments");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPayments();
  }, [user, token]);

  // Summary calculations
  const totalPaid = payments.filter(p => p.status === "completed").reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalPending = payments.filter(p => p.status === "pending").reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalFailed = payments.filter(p => p.status === "failed").reduce((sum, p) => sum + (p.amount || 0), 0);

  // Format currency
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(amount);

  // Format date
  const formatDate = (date: string | Date) =>
    new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  if (!user) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Access Denied</CardTitle>
            <CardDescription>You need to be logged in to access this page</CardDescription>
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
    <div className="container py-8 animate-in fade-in duration-500 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Payments Overview</h1>
          <p className="text-muted-foreground">Track all your school payments in one place.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/parent/payments/make">
            <Button className="gap-1 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" /> Make Payment
            </Button>
          </Link>
          <Link href="/parent/payments/history">
            <Button variant="outline" className="gap-1">
              <History className="h-4 w-4" /> Payment History
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="shadow-md border-blue-200">
          <CardHeader className="pb-2 flex flex-row items-center gap-2">
            <CircleDollarSign className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-700">{formatCurrency(totalPaid)}</p>
          </CardContent>
        </Card>
        <Card className="shadow-md border-yellow-200">
          <CardHeader className="pb-2 flex flex-row items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <CardTitle className="text-lg">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-700">{formatCurrency(totalPending)}</p>
          </CardContent>
        </Card>
        <Card className="shadow-md border-red-200">
          <CardHeader className="pb-2 flex flex-row items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <CardTitle className="text-lg">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-700">{formatCurrency(totalFailed)}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>See your latest payments and their status.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : error ? (
            <div className="text-center text-destructive py-8">
              <AlertCircle className="inline-block mr-2 h-5 w-5" />
              {error}
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No payments found. Start by making your first payment!
            </div>
          ) : (
            <div className="divide-y">
              {payments.slice(0, 6).map((payment) => (
                <div key={payment._id} className="flex flex-col md:flex-row md:items-center justify-between py-4 gap-2">
                  <div className="flex-1">
                    <div className="font-medium text-lg">
                      {payment.description || `${payment.type.charAt(0).toUpperCase() + payment.type.slice(1)} payment`}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(payment.date)}
                    </div>
                  </div>
                  <div className="flex flex-col md:items-end items-start gap-1 min-w-[120px]">
                    <span className="font-bold text-base">
                      {formatCurrency(payment.amount)}
                    </span>
                    <Badge
                      variant="outline"
                      className={
                        payment.status === "completed"
                          ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                          : payment.status === "pending"
                          ? "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800"
                          : payment.status === "failed"
                          ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                          : ""
                      }
                    >
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end">
          <Link href="/parent/payments/history">
            <Button variant="ghost" className="gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardFooter>
      </Card>

      {totalPending > 0 && (
        <div className="mt-8">
          <Card className="border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 animate-in fade-in duration-500">
            <CardContent className="flex items-center gap-3 p-4">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  <span className="font-medium">Action needed:</span> You have pending payments. Please complete them to avoid service interruption.
                </p>
              </div>
              <Link href="/parent/payments/make">
                <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                  Pay Now
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 