export interface PaymentRate {
  daily: number;
  weekly: number;
  monthly: number;
}

export interface Student {
  _id: string;
  name: string;
  grade: string;
  admissionNumber: string;
  balance: number;
  lastPayment?: Date;
  status: 'active' | 'inactive';
  parent: string;
  dietaryPreferences: string[];
  allergies: string[];
  otherAllergies?: string;
  additionalNotes?: string;
  paymentRates: {
    lunch: PaymentRate;
    tuition: PaymentRate;
    transport: PaymentRate;
  };
}

export interface Payment {
  _id: string;
  student: string;
  amount: number;
  type: 'lunch' | 'tuition' | 'transport' | 'other';
  paymentCategory: 'daily' | 'weekly' | 'monthly' | 'custom';
  numberOfDays?: number;
  startDate?: Date;
  endDate?: Date;
  description: string;
  date: Date;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
  flwRef?: string;
  paymentLink?: string;
  transactionId?: string;
  error?: string;
  flutterwaveResponse?: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    device_fingerprint: string;
    amount: number;
    currency: string;
    charged_amount: number;
    app_fee: number;
    merchant_fee: number;
    processor_response: string;
    auth_model: string;
    ip: string;
    narration: string;
    status: string;
    payment_type: string;
    created_at: string;
    account_id: number;
  };
}

export interface QuickPaymentData {
  studentId: string;
  amount: number;
  type: Payment['type'];
  paymentCategory: Payment['paymentCategory'];
  numberOfDays?: number;
  startDate?: Date;
  endDate?: Date;
  description: string;
  date: Date;
}

export interface QuickPaymentProps {
  students: Student[];
  onSubmit: (data: QuickPaymentData) => Promise<void>;
}

export interface PaymentSummaryProps {
  students: Student[];
  payments: Payment[];
}

export interface UpcomingPaymentsProps {
  students: Student[];
  payments: Payment[];
}

export interface RecentTransactionsProps {
  transactions: Payment[];
} 