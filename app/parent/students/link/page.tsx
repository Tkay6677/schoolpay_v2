"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Link2, LinkIcon, CheckCircle2 } from 'lucide-react';

export default function LinkStudentPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [studentId, setStudentId] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLinked, setIsLinked] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentId || !verificationCode) {
      toast({
        title: "Missing information",
        description: "Please provide both the student ID and verification code",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate verification process
    setTimeout(() => {
      setIsSubmitting(false);
      
      // Simulate successful linking
      if (studentId === 'S12347' && verificationCode === '123456') {
        setIsLinked(true);
        toast({
          title: "Student linked successfully",
          description: "You can now manage their lunch account",
        });
      } else {
        toast({
          title: "Verification failed",
          description: "The student ID or verification code is incorrect",
          variant: "destructive",
        });
      }
    }, 1500);
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
  
  if (isLinked) {
    return (
      <div className="container py-12 max-w-md animate-in fade-in duration-500">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">Student Linked!</CardTitle>
            <CardDescription>
              The student has been successfully linked to your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-medium mb-2">Student Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span>Michael Johnson</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Grade:</span>
                  <span>7</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">School:</span>
                  <span>Lincoln Middle School</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Student ID:</span>
                  <span>S12347</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link href="/parent/students">
                View All Students
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/parent/dashboard">
                Return to Dashboard
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container py-6 max-w-md animate-in fade-in duration-500">
      <div className="flex items-center mb-6">
        <Link href="/parent/students">
          <Button variant="outline" size="icon" className="mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Link Student</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Link Your Child</CardTitle>
          <CardDescription>
            Enter your child's student ID and verification code
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="studentId">Student ID</Label>
              <Input
                id="studentId"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g., S12345"
              />
              <p className="text-xs text-muted-foreground">
                This is the ID provided by your school
              </p>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="verificationCode">Verification Code</Label>
              <Input
                id="verificationCode"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="e.g., 123456"
              />
              <p className="text-xs text-muted-foreground">
                The verification code can be obtained from your school's administration office
              </p>
            </div>
            
            <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3 text-sm text-blue-800 dark:text-blue-300">
              <div className="flex gap-2">
                <LinkIcon className="h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Don't have a verification code?</p>
                  <p className="mt-1">Contact your school's administration office to get a verification code for linking your child's account.</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Verifying...' : 'Link Student'}
            </Button>
            
            <Separator />
            
            <div className="text-center text-sm text-muted-foreground">
              <p>For demo purposes, use:</p>
              <p>Student ID: S12347, Verification Code: 123456</p>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}