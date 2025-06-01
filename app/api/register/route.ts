import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import clientPromise from '@/lib/mongodb';
import type { User, RegisterResponse } from '@/lib/types';

// Set the runtime to edge for better performance
export const runtime = 'nodejs';

export async function POST(request: Request) {
  // Set response headers
  const headers = {
    'Content-Type': 'application/json',
  };

  try {
    if (request.method !== 'POST') {
      return NextResponse.json<RegisterResponse>(
        { success: false, message: 'Method not allowed' },
        { status: 405, headers }
      );
    }

    const body = await request.json();
    const { name, email, password, role } = body;

    // Validate input
    if (!name || !email || !password || !role) {
      return NextResponse.json<RegisterResponse>(
        { success: false, message: 'Missing required fields' },
        { status: 400, headers }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json<RegisterResponse>(
        { success: false, message: 'Invalid email format' },
        { status: 400, headers }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json<RegisterResponse>(
        { success: false, message: 'Password must be at least 6 characters long' },
        { status: 400, headers }
      );
    }

    try {
      // Connect to MongoDB
      const client = await clientPromise;
      const db = client.db('schoolpay');
      const usersCollection = db.collection<User>('users');

      // Check if user already exists
      const existingUser = await usersCollection.findOne({ email });
      if (existingUser) {
        return NextResponse.json<RegisterResponse>(
          { success: false, message: 'Email already registered' },
          { status: 400, headers }
        );
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const newUser: User = {
        name,
        email,
        password: hashedPassword,
        role,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await usersCollection.insertOne(newUser);

      // Return success response without password
      const { password: _, ...userWithoutPassword } = newUser;
      return NextResponse.json<RegisterResponse>(
        {
          success: true,
          message: 'User registered successfully',
          user: userWithoutPassword,
        },
        { status: 201, headers }
      );
    } catch (dbError) {
      console.error('MongoDB operation failed:', dbError);
      return NextResponse.json<RegisterResponse>(
        { 
          success: false, 
          message: 'Database operation failed: ' + (dbError instanceof Error ? dbError.message : 'Unknown database error')
        },
        { status: 500, headers }
      );
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json<RegisterResponse>(
      { 
        success: false, 
        message: 'Request processing failed: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500, headers }
    );
  }
} 