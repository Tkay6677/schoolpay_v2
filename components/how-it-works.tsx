import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BadgeCheck, CreditCard, Calendar, User } from 'lucide-react';

export function HowItWorks() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm dark:bg-blue-800">
              How It Works
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Simple, Secure, Streamlined</h2>
            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Our school lunch payment system makes it easy to manage your child's lunch payments
              without the Monday morning rush.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mt-12">
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 h-16 w-16">
              <div className="absolute transform rotate-45 bg-blue-600 text-center text-white font-semibold py-1 right-[-35px] top-[32px] w-[170px]">
                Step 1
              </div>
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Create an Account</CardTitle>
              <CardDescription>Quick and easy registration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-20">
                <User className="h-12 w-12 text-blue-600" />
              </div>
              <p className="text-sm text-muted-foreground">
                Register as a parent and link your account to your child's student profile.
              </p>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 h-16 w-16">
              <div className="absolute transform rotate-45 bg-blue-600 text-center text-white font-semibold py-1 right-[-35px] top-[32px] w-[170px]">
                Step 2
              </div>
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Choose a Plan</CardTitle>
              <CardDescription>Daily, weekly, or monthly</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-20">
                <Calendar className="h-12 w-12 text-blue-600" />
              </div>
              <p className="text-sm text-muted-foreground">
                Select the payment plan that works best for your schedule and budget.
              </p>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 h-16 w-16">
              <div className="absolute transform rotate-45 bg-blue-600 text-center text-white font-semibold py-1 right-[-35px] top-[32px] w-[170px]">
                Step 3
              </div>
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Make a Payment</CardTitle>
              <CardDescription>Secure online transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-20">
                <CreditCard className="h-12 w-12 text-blue-600" />
              </div>
              <p className="text-sm text-muted-foreground">
                Pay securely with your credit card through our Stripe integration.
              </p>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 h-16 w-16">
              <div className="absolute transform rotate-45 bg-blue-600 text-center text-white font-semibold py-1 right-[-35px] top-[32px] w-[170px]">
                Step 4
              </div>
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Lunch is Served</CardTitle>
              <CardDescription>Track lunch eligibility</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-20">
                <BadgeCheck className="h-12 w-12 text-blue-600" />
              </div>
              <p className="text-sm text-muted-foreground">
                Your child is automatically eligible for lunch based on your payment status.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}