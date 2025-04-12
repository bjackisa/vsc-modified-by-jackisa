import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ 
        authenticated: false,
        message: 'Not authenticated' 
      });
    }

    // Get user from Clerk
    const user = auth().user;
    if (!user) {
      return NextResponse.json({ 
        authenticated: true,
        hasEmail: false,
        message: 'User found but no email available'
      });
    }

    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) {
      return NextResponse.json({ 
        authenticated: true,
        hasEmail: false,
        message: 'User has no email address'
      });
    }

    // Check if user exists in our database
    const dbUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (dbUser.length === 0) {
      return NextResponse.json({ 
        authenticated: true,
        hasEmail: true,
        email: email,
        inDatabase: false,
        message: 'User not found in database'
      });
    }

    return NextResponse.json({ 
      authenticated: true,
      hasEmail: true,
      email: email,
      inDatabase: true,
      userId: dbUser[0].id,
      role: dbUser[0].role,
      name: dbUser[0].name
    });
  } catch (error) {
    console.error('Error checking role:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error
    }, { status: 500 });
  }
}
