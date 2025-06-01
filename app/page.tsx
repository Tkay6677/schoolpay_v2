import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HowItWorks } from '@/components/how-it-works';
import { Features } from '@/components/features';

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-background">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Simplify School Lunch Payments
                </h1>
                <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                  No more Monday morning stress. Pay for your child's lunch online, track payments, and manage meal preferences all in one place.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/register" passHref>
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">Get Started</Button>
                </Link>
                <Link href="/login" passHref>
                  <Button size="lg" variant="outline">Sign In</Button>
                </Link>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <div className="relative h-[350px] w-full max-w-[500px] overflow-hidden rounded-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 opacity-20 dark:opacity-40"></div>
                <div className="relative flex h-full items-center justify-center">
                  <div className="grid gap-4 p-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Monthly Plan</CardTitle>
                        <CardDescription>September 2023</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">$85.00</div>
                        <p className="text-xs text-muted-foreground">20 school days</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Weekly Plan</CardTitle>
                        <CardDescription>Sep 18 - Sep 22</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">$25.00</div>
                        <p className="text-xs text-muted-foreground">5 school days</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works section */}
      <HowItWorks />

      {/* Features */}
      <Features />

      {/* CTA section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-blue-50 dark:bg-gray-900">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to simplify lunch payments?
              </h2>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Join parents who have already made the switch to our convenient online payment system.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/register" passHref>
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">Get Started</Button>
              </Link>
              <Link href="/about" passHref>
                <Button size="lg" variant="outline">Learn More</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}