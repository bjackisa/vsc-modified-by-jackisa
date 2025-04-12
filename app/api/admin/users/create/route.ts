import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import { getAdminSession } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated as admin
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only super_admin can create users
    if (session.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await request.formData();
    const email = formData.get('email') as string;
    const name = formData.get('name') as string;
    const password = formData.get('password') as string;
    const role = formData.get('role') as 'student' | 'admin' | 'super_admin';

    if (!email || !name || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      id: `user_${Date.now()}`,
      email,
      name,
      password: hashedPassword,
      role,
      created_at: new Date(),
    };

    await db.insert(users).values(newUser);

    // Redirect to users page
    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      redirect: '/admin/users'
    });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
