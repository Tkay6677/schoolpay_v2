import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { verifyAuth } from '@/lib/auth';

// Get lunch orders
export async function GET(req: Request) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1];
    const user = await verifyAuth(token);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    const date = searchParams.get('date');

    const client = await clientPromise;
    const db = client.db();

    let query: any = {};

    if (date) {
      const orderDate = new Date(date);
      query.date = {
        $gte: new Date(orderDate.setHours(0, 0, 0, 0)),
        $lt: new Date(orderDate.setHours(23, 59, 59, 999))
      };
    }

    if (user.role === 'parent' && studentId) {
      // Verify parent has access to this student
      const student = await db.collection('students').findOne({
        _id: new ObjectId(studentId),
        parentId: new ObjectId(user.id)
      });

      if (!student) {
        return NextResponse.json(
          { error: 'Student not found or access denied' },
          { status: 404 }
        );
      }

      query.studentId = new ObjectId(studentId);
    } else if (user.role === 'admin' && studentId) {
      query.studentId = new ObjectId(studentId);
    }

    const orders = await db.collection('lunchOrders')
      .find(query)
      .sort({ date: -1 })
      .toArray();

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching lunch orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create lunch order
export async function POST(req: Request) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1];
    const user = await verifyAuth(token);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { studentId, menuItemId, date, specialInstructions } = await req.json();

    if (!studentId || !menuItemId || !date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Verify user has access to this student
    if (user.role === 'parent') {
      const student = await db.collection('students').findOne({
        _id: new ObjectId(studentId),
        parentId: new ObjectId(user.id)
      });

      if (!student) {
        return NextResponse.json(
          { error: 'Student not found or access denied' },
          { status: 404 }
        );
      }
    }

    // Verify menu item exists and is available
    const menuItem = await db.collection('menu').findOne({
      _id: new ObjectId(menuItemId),
      available: true
    });

    if (!menuItem) {
      return NextResponse.json(
        { error: 'Menu item not found or unavailable' },
        { status: 404 }
      );
    }

    // Create order
    const result = await db.collection('lunchOrders').insertOne({
      studentId: new ObjectId(studentId),
      menuItemId: new ObjectId(menuItemId),
      date: new Date(date),
      specialInstructions: specialInstructions || '',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      { message: 'Order created successfully', orderId: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating lunch order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}