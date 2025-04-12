import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json({
        success: false,
        message: 'Email, password, and name are required'
      }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'User with this email already exists'
      }, { status: 409 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with super_admin role
    const newUser = {
      id: `admin-${Date.now()}`,
      email,
      name,
      password: hashedPassword,
      role: 'super_admin',
      created_at: new Date(),
    };

    await db.insert(users).values(newUser);

    // Return success without the password
    return NextResponse.json({
      success: true,
      message: 'Admin account created successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Admin signup error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
