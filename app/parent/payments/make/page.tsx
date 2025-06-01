"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, CreditCard, Calendar, Calculator } from 'lucide-react';

export default function MakePaymentPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [student, setStudent] = useState<string>('');
  const [paymentType, setPaymentType] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Mock data - in a real app, this would be fetched from the database
  const students = [
    { id: '1', name: 'Alex Johnson', grade: '5' },
    { id: '2', name: 'Sarah Johnson', grade: '3' },
  ];
  
  const paymentOptions = [
    { id: 'daily', label: 'Daily Payment', amount: 5, description: 'Pay for a single day' },
    { id: 'weekly', label: 'Weekly Payment', amount: 25, description: 'Pay for 5 school days (Mon-Fri)' },
    { id: 'biweekly', label: 'Bi-Weekly Payment', amount: 50, description: 'Pay for 10 school days (2 weeks)' },
    { id: 'monthly', label: 'Monthly Payment', amount: 85, description: 'Pay for the entire month (saves $15)' },
  ];
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!student || !paymentType) {
      toast({
        title: "Missing information",
        description: "Please select both a student and payment type",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate payment processing
    setTimeout(() => {
      // In a real app, this would redirect to Stripe checkout
      window.location.href = `/parent/payments/checkout?student=${student}&type=${paymentType}`;
    }, 1000);
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  // Find selected payment option
  const selectedPayment = paymentOptions.find(option => option.id === paymentType);
  
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
    <div className="container py-6 max-w-2xl animate-in fade-in duration-500">
      <div className="flex items-center mb-6">
        <Link href="/parent/dashboard">
          <Button variant="outline" size="icon" className="mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Make a Payment</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
          <CardDescription>
            Select a student and payment option
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="student">Select Student</Label>
              <Select
                value={student}
                onValueChange={setStudent}
              >
                <SelectTrigger id="student">
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} (Grade {student.grade})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Payment Type</Label>
              <RadioGroup value={paymentType} onValueChange={setPaymentType} className="grid gap-4 pt-2">
                {paymentOptions.map((option) => (
                  <div key={option.id}>
                    <RadioGroupItem
                      value={option.id}
                      id={option.id}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={option.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-muted/50 hover:border-muted peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary transition-all"
                    >
                      <div className="flex items-center gap-3">
                        {option.id === 'daily' && <Calculator className="h-5 w-5 text-blue-600" />}
                        {option.id === 'weekly' && <Calendar className="h-5 w-5 text-blue-600" />}
                        {option.id === 'biweekly' && <Calendar className="h-5 w-5 text-blue-600" />}
                        {option.id === 'monthly' && <Calendar className="h-5 w-5 text-blue-600" />}
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-sm text-muted-foreground">
                            {option.description}
                          </div>
                        </div>
                      </div>
                      <div className="font-bold text-lg mt-2 sm:mt-0">
                        {formatCurrency(option.amount)}
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            {student && paymentType && (
              <div className="rounded-lg border bg-card p-4 animate-in fade-in duration-300">
                <h3 className="font-medium mb-2">Payment Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Student:</span>
                    <span>{students.find(s => s.id === student)?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plan:</span>
                    <span>{selectedPayment?.label}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Total:</span>
                    <span>{selectedPayment ? formatCurrency(selectedPayment.amount) : '$0.00'}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isSubmitting || !student || !paymentType}>
              {isSubmitting ? 'Processing...' : 'Continue to Payment'}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Secure payment powered by Stripe
              <CreditCard className="inline-block ml-1 h-3 w-3" />
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}