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
    
    // Only super_admin can update user roles
    if (role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const formData = await request.formData();
    const targetUserId = formData.get('userId') as string;
    const newRole = formData.get('role') as 'admin' | 'student';
    
    if (!targetUserId || !newRole) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Check if user exists in our database
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, targetUserId))
      .limit(1);
    
    if (existingUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Prevent changing super_admin role
    if (existingUser[0].role === 'super_admin') {
      return NextResponse.json({ error: 'Cannot change super admin role' }, { status: 403 });
    }
    
    // Update user role in our database
    await db
      .update(users)
      .set({ role: newRole })
      .where(eq(users.id, targetUserId));
    
    // Update user role in Clerk
    try {
      await clerkClient.users.updateUser(targetUserId, {
        publicMetadata: {
          role: newRole,
        },
      });
    } catch (error) {
      console.error('[UPDATE_USER_ROLE] Clerk error:', error);
      // Continue even if Clerk update fails
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'User role updated successfully',
      redirect: '/admin/users'
    });
  } catch (error) {
    console.error('[UPDATE_USER_ROLE]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
