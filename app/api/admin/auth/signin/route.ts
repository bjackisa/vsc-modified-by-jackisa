import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import * as bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: 'Email and password are required'
      }, { status: 400 });
    }

    // Check if user exists
    const dbUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (dbUser.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Invalid credentials'
      }, { status: 401 });
    }

    const user = dbUser[0];

    // Check if user has a password (might be a Clerk user)
    if (!user.password) {
      return NextResponse.json({
        success: false,
        message: 'This account cannot use password authentication'
      }, { status: 401 });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({
        success: false,
        message: 'Invalid credentials'
      }, { status: 401 });
    }

    // Check if user is an admin
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      // If not an admin, update their role to super_admin
      await db
        .update(users)
        .set({ role: 'super_admin' })
        .where(eq(users.id, user.id));

      // Update the user object
      user.role = 'super_admin';
    }

    // Set session cookie with user info
    const cookieStore = cookies();
    cookieStore.set({
      name: 'admin-session',
      value: user.id,
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
      sameSite: 'lax',
    });

    // Set role cookie for client-side access
    cookieStore.set({
      name: 'admin-role',
      value: user.role,
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
      sameSite: 'lax',
    });

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
