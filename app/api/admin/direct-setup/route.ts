import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    // Check if super admin already exists
    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.email, 'qudmeet@gmail.com'))
      .limit(1);
    
    if (existingAdmin.length > 0) {
      return NextResponse.redirect(new URL('/direct-admin', request.url));
    }
    
    // Create super admin user
    await db.insert(users).values({
      id: `user_${Math.random().toString(36).substring(2, 15)}`,
      email: 'qudmeet@gmail.com',
      name: 'Super Admin',
      role: 'super_admin',
      created_at: new Date(),
    });
    
    return NextResponse.redirect(new URL('/direct-admin', request.url));
  } catch (error) {
    console.error('[DIRECT_SETUP]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
