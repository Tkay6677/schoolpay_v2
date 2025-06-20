import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Student } from "@/lib/types/dashboard";
import { formatCurrency } from "@/lib/utils";
import { Calendar, Bus, GraduationCap, UtensilsCrossed } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface PaymentRatesProps {
  student: Student;
}

const DEFAULT_RATES = {
  lunch: {
    daily: 1000,
    weekly: 5000,
    monthly: 25000
  },
  tuition: {
    daily: 0,
    weekly: 0,
    monthly: 500000
  },
  transport: {
    daily: 200,
    weekly: 1000,
    monthly: 4000
  }
};

const PAYMENT_TYPE_CONFIG = {
  lunch: {
    icon: UtensilsCrossed,
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    label: 'Lunch Payment'
  },
  tuition: {
    icon: GraduationCap,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    label: 'Tuition Payment'
  },
  transport: {
    icon: Bus,
    color: 'bg-green-100 text-green-700 border-green-200',
    label: 'Transport Payment'
  }
} as const;

export function PaymentRates({ student }: PaymentRatesProps) {
  const paymentTypes = ['lunch', 'tuition', 'transport'] as const;
  const categories = ['daily', 'weekly', 'monthly'] as const;

  // Get the rate safely with fallback to default
  const getRate = (type: typeof paymentTypes[number], category: typeof categories[number]): number => {
    try {
      return student.paymentRates?.[type]?.[category] ?? DEFAULT_RATES[type][category];
    } catch {
      return DEFAULT_RATES[type][category];
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-xl flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Payment Rates
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {paymentTypes.map((type) => {
            const config = PAYMENT_TYPE_CONFIG[type];
            const Icon = config.icon;
            
            return (
              <Card key={type} className={`border-2 transition-all hover:shadow-lg ${config.color}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    {config.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {categories.map((category) => {
                      const rate = getRate(type, category);
                      const isAvailable = rate > 0;
                      
                      return (
                        <div
                          key={category}
                          className="flex justify-between items-center py-2 px-3 rounded-lg border bg-white/50 hover:bg-white/80 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Badge variant={isAvailable ? "default" : "secondary"} className="capitalize">
                              {category}
                            </Badge>
                          </div>
                          <span className={`font-medium ${isAvailable ? '' : 'text-muted-foreground'}`}>
                            {isAvailable ? formatCurrency(rate) : 'Not Available'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
} 