import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Please sign in first' }, { status: 401 });
    }

    // Check if this user is already in our database
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (existingUser.length > 0) {
      // User already exists, update role to super_admin
      await db
        .update(users)
        .set({ role: 'super_admin' })
        .where(eq(users.id, userId));

      return NextResponse.json({
        success: true,
        message: 'Your account has been updated to super admin',
        redirect: '/admin/dashboard'
      });
    }

    // Get user details from Clerk
    const user = auth().user;

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create user in our database
    await db.insert(users).values({
      id: userId,
      email: user.emailAddresses[0].emailAddress,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Admin User',
      role: 'super_admin',
      created_at: new Date(),
    });

    // Try to update Clerk metadata
    try {
      await clerkClient.users.updateUser(userId, {
        publicMetadata: {
          role: 'super_admin',
        },
      });
    } catch (error) {
      console.error('Failed to update Clerk metadata:', error);
      // Continue anyway
    }

    return NextResponse.json({
      success: true,
      message: 'Your account has been set up as super admin',
      redirect: '/admin/dashboard'
    });
  } catch (error) {
    console.error('[SETUP_ADMIN]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
