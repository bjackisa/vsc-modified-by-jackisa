import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Update the user's metadata to include the admin role
    await clerkClient.users.updateUser(userId, {
      publicMetadata: {
        role: 'admin',
      },
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Admin role set successfully',
      redirect: '/admin/dashboard'
    });
  } catch (error) {
    console.error('[SET_ADMIN_ROLE]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
