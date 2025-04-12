import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { getAdminSession } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated as admin
    const session = await getAdminSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Only super_admin can update user roles
    if (session.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const formData = await request.formData();
    const userId = formData.get('userId') as string;
    const role = formData.get('role') as 'student' | 'admin' | 'super_admin';
    
    if (!userId || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    if (existingUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Prevent changing own role
    if (userId === session.id) {
      return NextResponse.json({ error: 'Cannot change your own role' }, { status: 403 });
    }
    
    // Update user role
    await db
      .update(users)
      .set({ role })
      .where(eq(users.id, userId));
    
    // Redirect to users page
    return NextResponse.json({ 
      success: true, 
      message: 'User role updated successfully',
      redirect: '/admin/users'
    });
  } catch (error) {
    console.error('Update user role error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}
