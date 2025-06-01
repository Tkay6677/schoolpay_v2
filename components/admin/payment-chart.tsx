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

export function PaymentChart() {
  // Mock data - in a real app, this would be fetched from the database
  const data = [
    { month: 'Jan', daily: 150, weekly: 380, monthly: 680 },
    { month: 'Feb', daily: 120, weekly: 420, monthly: 720 },
    { month: 'Mar', daily: 180, weekly: 460, monthly: 820 },
    { month: 'Apr', daily: 170, weekly: 440, monthly: 780 },
    { month: 'May', daily: 200, weekly: 500, monthly: 900 },
    { month: 'Jun', daily: 120, weekly: 300, monthly: 550 },
    { month: 'Jul', daily: 80, weekly: 220, monthly: 450 },
    { month: 'Aug', daily: 210, weekly: 520, monthly: 950 },
    { month: 'Sep', daily: 190, weekly: 480, monthly: 850 },
  ];
  
  // Format currency for tooltip
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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
          tickFormatter={(value) => `$${value}`}
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