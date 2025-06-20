"use client";

import { 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend 
} from 'recharts';
import { Card } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { useToast } from '@/hooks/use-toast';

export function PaymentChart() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<{ month: string; daily: number; weekly: number; monthly: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/parent/payments', { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error('Failed to fetch payments');
        const payments = await res.json();
        const monthMap: Record<string, { month: string; daily: number; weekly: number; monthly: number }> = {};
        const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        payments.forEach((p: any) => {
          const date = new Date(p.date);
          const m = monthNames[date.getMonth()];
          if (!monthMap[m]) monthMap[m] = { month: m, daily: 0, weekly: 0, monthly: 0 };
          if (p.paymentCategory === 'daily') monthMap[m].daily += p.amount;
          else if (p.paymentCategory === 'weekly') monthMap[m].weekly += p.amount;
          else if (p.paymentCategory === 'monthly') monthMap[m].monthly += p.amount;
        });
        const sortedData = monthNames.filter(m => monthMap[m]).map(m => monthMap[m]);
        setData(sortedData);
      } catch (error: any) {
        console.error('Error fetching chart data:', error);
        toast({ title: 'Error loading chart', description: error.message, variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchChartData();
  }, [token, toast]);

  // Format currency for tooltip
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Card className="p-3 bg-background border shadow-sm">
          <p className="font-medium">{label}</p>
          <div className="mt-2 space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={`item-${index}`} className="flex items-center gap-2">
                <div 
                  className="h-3 w-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm">{entry.name}: {formatCurrency(entry.value)}</span>
              </div>
            ))}
          </div>
        </Card>
      );
    }
    
    return null;
  };
  
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart
        data={data}
        margin={{
          top: 10,
          right: 10,
          left: 10,
          bottom: 10,
        }}
        barSize={20}
        barGap={8}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
        <XAxis 
          dataKey="month" 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => formatCurrency(value as number)}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          iconType="circle" 
          wrapperStyle={{ paddingTop: 15 }}
        />
        <Bar 
          dataKey="daily" 
          name="Daily Payments" 
          fill="hsl(var(--chart-1))" 
          radius={[4, 4, 0, 0]} 
        />
        <Bar 
          dataKey="weekly" 
          name="Weekly Payments" 
          fill="hsl(var(--chart-2))" 
          radius={[4, 4, 0, 0]} 
        />
        <Bar 
          dataKey="monthly" 
          name="Monthly Payments" 
          fill="hsl(var(--chart-3))" 
          radius={[4, 4, 0, 0]} 
        />
      </BarChart>
    </ResponsiveContainer>
  );
}