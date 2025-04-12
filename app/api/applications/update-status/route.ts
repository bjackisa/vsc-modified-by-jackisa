import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { applications } from '@/lib/schema';
import { getAdminSession } from '@/lib/admin-auth';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated as admin
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admin or super_admin can update status
    if (session.role !== 'admin' && session.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await request.formData();
    const applicationId = formData.get('applicationId') as string;
    const status = formData.get('status') as 'pending' | 'approved' | 'rejected';

    if (!applicationId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate status
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Update application status
    const updatedApplication = await db
      .update(applications)
      .set({
        status,
        updated_at: new Date()
      })
      .where(eq(applications.id, applicationId))
      .returning();

    if (updatedApplication.length === 0) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Application status updated to ${status} successfully`,
      application: updatedApplication[0]
    });
  } catch (error) {
    console.error('[UPDATE_STATUS]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
