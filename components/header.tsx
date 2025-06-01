"use client";

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth-provider';
import { ModeToggle } from '@/components/mode-toggle';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X, ShoppingBag, UserCircle } from 'lucide-react';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" aria-label="Toggle Menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <div className="flex h-full flex-col">
                <div className="flex items-center border-b py-4">
                  <Link href="/" className="flex items-center gap-2 font-semibold" onClick={() => setIsOpen(false)}>
                    <ShoppingBag className="h-5 w-5 text-blue-600" />
                    <span>School Lunch Pay</span>
                  </Link>
                  <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setIsOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <nav className="flex-1 overflow-auto py-4">
                  <div className="flex flex-col gap-2">
                    {!user ? (
                      <>
                        <Link href="/login" onClick={() => setIsOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start">Login</Button>
                        </Link>
                        <Link href="/register" onClick={() => setIsOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start">Register</Button>
                        </Link>
                      </>
                    ) : user.role === 'parent' ? (
                      <>
                        <Link href="/parent/dashboard" onClick={() => setIsOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start">Dashboard</Button>
                        </Link>
                        <Link href="/parent/payments" onClick={() => setIsOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start">Payments</Button>
                        </Link>
                        <Link href="/parent/students" onClick={() => setIsOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start">My Students</Button>
                        </Link>
                        <Button variant="ghost" className="w-full justify-start" onClick={() => { logout(); setIsOpen(false); }}>
                          Logout
                        </Button>
                      </>
                    ) : (
                      <>
                        <Link href="/admin/dashboard" onClick={() => setIsOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start">Dashboard</Button>
                        </Link>
                        <Link href="/admin/students" onClick={() => setIsOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start">Students</Button>
                        </Link>
                        <Link href="/admin/payments" onClick={() => setIsOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start">Payments</Button>
                        </Link>
                        <Link href="/admin/lunch-eligibility" onClick={() => setIsOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start">Lunch Eligibility</Button>
                        </Link>
                        <Button variant="ghost" className="w-full justify-start" onClick={() => { logout(); setIsOpen(false); }}>
                          Logout
                        </Button>
                      </>
                    )}
                  </div>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <ShoppingBag className="h-5 w-5 text-blue-600" />
            <span className="hidden sm:inline-block">School Lunch Pay</span>
          </Link>
        </div>
        <nav className="hidden gap-6 lg:flex">
          {!user ? (
            <>
              <Link href="/" className={`text-sm font-medium ${isActive('/') ? 'text-primary' : 'text-muted-foreground'} transition-colors hover:text-primary`}>
                Home
              </Link>
              <Link href="/about" className={`text-sm font-medium ${isActive('/about') ? 'text-primary' : 'text-muted-foreground'} transition-colors hover:text-primary`}>
                About
              </Link>
              <Link href="/pricing" className={`text-sm font-medium ${isActive('/pricing') ? 'text-primary' : 'text-muted-foreground'} transition-colors hover:text-primary`}>
                Pricing
              </Link>
            </>
          ) : user.role === 'parent' ? (
            <>
              <Link href="/parent/dashboard" className={`text-sm font-medium ${isActive('/parent/dashboard') ? 'text-primary' : 'text-muted-foreground'} transition-colors hover:text-primary`}>
                Dashboard
              </Link>
              <Link href="/parent/payments" className={`text-sm font-medium ${isActive('/parent/payments') ? 'text-primary' : 'text-muted-foreground'} transition-colors hover:text-primary`}>
                Payments
              </Link>
              <Link href="/parent/students" className={`text-sm font-medium ${isActive('/parent/students') ? 'text-primary' : 'text-muted-foreground'} transition-colors hover:text-primary`}>
                My Students
              </Link>
            </>
          ) : (
            <>
              <Link href="/admin/dashboard" className={`text-sm font-medium ${isActive('/admin/dashboard') ? 'text-primary' : 'text-muted-foreground'} transition-colors hover:text-primary`}>
                Dashboard
              </Link>
              <Link href="/admin/students" className={`text-sm font-medium ${isActive('/admin/students') ? 'text-primary' : 'text-muted-foreground'} transition-colors hover:text-primary`}>
                Students
              </Link>
              <Link href="/admin/payments" className={`text-sm font-medium ${isActive('/admin/payments') ? 'text-primary' : 'text-muted-foreground'} transition-colors hover:text-primary`}>
                Payments
              </Link>
              <Link href="/admin/lunch-eligibility" className={`text-sm font-medium ${isActive('/admin/lunch-eligibility') ? 'text-primary' : 'text-muted-foreground'} transition-colors hover:text-primary`}>
                Lunch Eligibility
              </Link>
            </>
          )}
        </nav>
        <div className="flex items-center gap-2">
          <ModeToggle />
          {!user ? (
            <div className="hidden lg:flex gap-2">
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/register">
                <Button>Register</Button>
              </Link>
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-2">
              <Button variant="ghost" className="flex items-center gap-2" asChild>
                <Link href={user.role === 'parent' ? '/parent/profile' : '/admin/profile'}>
                  <UserCircle className="h-5 w-5" />
                  <span>{user.name}</span>
                </Link>
              </Button>
              <Button variant="outline" onClick={logout}>
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}