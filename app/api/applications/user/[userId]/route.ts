import { db } from '@/lib/db';
import { applications } from '@/lib/schema';
import { auth } from '@clerk/nextjs/server';
import { getAdminSession } from '@/lib/admin-auth';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;
    
    // Check authentication - either the user themselves or an admin can view applications
    const { userId: clerkUserId } = await auth();
    const adminSession = await getAdminSession();
    
    if (!clerkUserId && !adminSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Only allow users to view their own applications unless they're an admin
    if (clerkUserId !== userId && !adminSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch applications for the user
    const userApplications = await db
      .select()
      .from(applications)
      .where(eq(applications.user_id, userId));

    return NextResponse.json(userApplications);
  } catch (error) {
    console.error('[USER_APPLICATIONS_GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
