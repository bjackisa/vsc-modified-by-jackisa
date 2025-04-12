import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { clerkClient } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }
    
    // Check if user exists in our database
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    
    if (existingUser.length === 0) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }
    
    const user = existingUser[0];
    
    // Check if user is an admin or super_admin
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    try {
      // Sign in with Clerk
      const signInToken = await clerkClient.signInTokens.createSignInToken({
        userId: user.id,
        email: user.email,
        redirectUrl: '/admin/dashboard',
      });
      
      // Redirect to the Clerk sign-in verification
      return NextResponse.redirect(signInToken.url);
    } catch (error) {
      console.error('[ADMIN_LOGIN] Clerk error:', error);
      return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
    }
  } catch (error) {
    console.error('[ADMIN_LOGIN]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
