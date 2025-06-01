import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import clientPromise from '@/lib/mongodb';
import type { User } from '@/lib/types';

export const runtime = 'nodejs';

interface LoginResponse {
  success: boolean;
  message: string;
  user?: Omit<User, 'password'>;
}

export async function POST(request: Request) {
  const headers = {
    'Content-Type': 'application/json',
  };

  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json<LoginResponse>(
        { success: false, message: 'Email and password are required' },
        { status: 400, headers }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('schoolpay');
    const usersCollection = db.collection<User>('users');

    // Find user by email
    const user = await usersCollection.findOne({ email });

    if (!user) {
      return NextResponse.json<LoginResponse>(
        { success: false, message: 'Invalid email or password' },
        { status: 401, headers }
      );
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json<LoginResponse>(
        { success: false, message: 'Invalid email or password' },
        { status: 401, headers }
      );
    }

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json<LoginResponse>(
      {
        success: true,
        message: 'Login successful',
        user: userWithoutPassword,
      },
      { status: 200, headers }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json<LoginResponse>(
      { 
        success: false, 
        message: 'Login failed: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500, headers }
    );
  }
} 