"use client";

import { useState } from 'react';
import { QuickPaymentProps, Student } from '@/lib/types/dashboard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth-provider';
import { Loader2, CalendarIcon } from 'lucide-react';
import { format, addDays, differenceInDays } from 'date-fns';
import { cn, formatCurrency } from '@/lib/utils';

const DEFAULT_RATES = {
  lunch: {
    daily: 500,
    weekly: 2500,
    monthly: 10000
  },
  tuition: {
    daily: 0,
    weekly: 0,
    monthly: 50000
  },
  transport: {
    daily: 200,
    weekly: 1000,
    monthly: 4000
  }
};

export function QuickPayment({ students }: QuickPaymentProps) {
  const [selectedStudent, setSelectedStudent] = useState('');
  const [paymentType, setPaymentType] = useState<'lunch' | 'tuition' | 'transport'>('lunch');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(addDays(new Date(), 6));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { token } = useAuth();

  // Get rate safely with fallback to default
  const getRate = (
    student: Student | undefined,
    type: typeof paymentType,
    category: 'daily' | 'weekly' | 'monthly'
  ): number => {
    try {
      return student?.paymentRates?.[type]?.[category] ?? DEFAULT_RATES[type][category];
    } catch {
      return DEFAULT_RATES[type][category];
    }
  };

  // Calculate number of days and amount
  const calculatePayment = () => {
    if (!selectedStudent || !startDate || !endDate) return null;

    const student = students.find(s => s._id === selectedStudent);
    if (!student) return null;

    const days = differenceInDays(endDate, startDate) + 1;
    const dailyRate = getRate(student, paymentType, 'daily');
    const weeklyRate = getRate(student, paymentType, 'weekly');
    const monthlyRate = getRate(student, paymentType, 'monthly');

    // Calculate the most cost-effective payment category
    const totalDailyRate = dailyRate * days;
    const fullWeeks = Math.floor(days / 7);
    const remainingDays = days % 7;
    const totalWeeklyRate = (fullWeeks * weeklyRate) + (remainingDays * dailyRate);
    const fullMonths = Math.floor(days / 30);
    const remainingWeeks = Math.floor((days % 30) / 7);
    const finalRemainingDays = days % 7;
    const totalMonthlyRate = (fullMonths * monthlyRate) + 
                            (remainingWeeks * weeklyRate) + 
                            (finalRemainingDays * dailyRate);

    // Find the minimum rate
    const rates = [
      { category: 'daily', amount: totalDailyRate },
      { category: 'weekly', amount: totalWeeklyRate },
      { category: 'monthly', amount: totalMonthlyRate }
    ].filter(rate => rate.amount > 0);

    if (rates.length === 0) {
      return {
        numberOfDays: days,
        amount: 0,
        category: 'custom' as const,
        error: `No rates configured for ${paymentType} payments`
      };
    }

    const bestRate = rates.reduce((prev, current) => 
      current.amount < prev.amount ? current : prev
    );

    return {
      numberOfDays: days,
      amount: bestRate.amount,
      category: bestRate.category as 'daily' | 'weekly' | 'monthly' | 'custom'
    };
  };

  const payment = calculatePayment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !payment || payment.amount === 0 || !startDate || !endDate) return;

    try {
      setIsSubmitting(true);

      const res = await fetch('/api/parent/payments/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          studentId: selectedStudent,
          amount: payment.amount,
          type: paymentType,
          paymentCategory: payment.category,
          numberOfDays: payment.numberOfDays,
          startDate,
          endDate,
          description: `${payment.numberOfDays} days of ${paymentType} payment`,
          date: new Date(),
        })
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);

      window.location.href = data.paymentLink;

    } catch (error) {
      console.error('Error initiating payment:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to initiate payment",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Select
          value={selectedStudent}
          onValueChange={setSelectedStudent}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select student" />
          </SelectTrigger>
          <SelectContent>
            {students.map((student) => (
              <SelectItem key={student._id} value={student._id}>
                {student.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Select
          value={paymentType}
          onValueChange={(value: 'lunch' | 'tuition' | 'transport') => setPaymentType(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select payment type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lunch">Lunch Payment</SelectItem>
            <SelectItem value="tuition">Tuition Payment</SelectItem>
            <SelectItem value="transport">Transport Payment</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Start Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => date && setStartDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">End Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date) => date && setEndDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {payment && (
        <div className="rounded-lg border p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Number of Days:</span>
            <span className="font-medium">{payment.numberOfDays} days</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Payment Category:</span>
            <span className="font-medium capitalize">{payment.category}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Amount:</span>
            <span className="font-medium">
              {payment.amount > 0 ? formatCurrency(payment.amount) : 'Not Available'}
            </span>
          </div>
          {payment.error && (
            <div className="text-sm text-destructive mt-2">
              {payment.error}
            </div>
          )}
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={!selectedStudent || !payment || payment.amount === 0 || isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Make Payment'
        )}
      </Button>
    </form>
  );
}