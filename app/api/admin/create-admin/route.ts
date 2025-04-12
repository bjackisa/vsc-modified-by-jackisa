import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user role from metadata
    const currentUser = auth().user;
    const role = currentUser?.publicMetadata?.role as string | undefined;
    
    // Only super_admin can create admin users
    if (role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const name = formData.get('name') as string;
    const password = formData.get('password') as string;
    const userRole = formData.get('role') as 'admin' | 'student';
    
    if (!email || !name || !password || !userRole) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Check if user already exists in our database
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    
    if (existingUser.length > 0) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }
    
    // Create user in Clerk
    try {
      const clerkUser = await clerkClient.users.createUser({
        emailAddress: [email],
        password,
        firstName: name.split(' ')[0],
        lastName: name.split(' ').slice(1).join(' ') || '',
        publicMetadata: {
          role: userRole,
        },
      });
      
      // Create user in our database
      await db.insert(users).values({
        id: clerkUser.id,
        email,
        name,
        role: userRole,
        created_at: new Date(),
      });
      
      return NextResponse.json({ 
        success: true, 
        message: 'User created successfully',
        redirect: '/admin/users'
      });
    } catch (error) {
      console.error('[CREATE_ADMIN]', error);
      return NextResponse.json({ error: 'Failed to create user in Clerk' }, { status: 500 });
    }
  } catch (error) {
    console.error('[CREATE_ADMIN]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
