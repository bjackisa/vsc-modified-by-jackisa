import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { applications, documents, users } from '@/lib/schema';
import { getAdminSession } from '@/lib/admin-auth';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated as admin
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admin or super_admin can export application data
    if (session.role !== 'admin' && session.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('id');

    if (!applicationId) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
    }

    // Get application with user and documents
    const applicationData = await db
      .select({
        id: applications.id,
        status: applications.status,
        application_data: applications.application_data,
        user: users,
        created_at: applications.created_at,
        updated_at: applications.updated_at,
      })
      .from(applications)
      .where(eq(applications.id, applicationId))
      .leftJoin(users, eq(applications.user_id, users.id))
      .limit(1);

    if (applicationData.length === 0) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const application = applicationData[0];

    // Get documents for this application
    const applicationDocuments = await db
      .select()
      .from(documents)
      .where(eq(documents.application_id, applicationId));

    // Create a JSON object with all application data
    const exportData = {
      application: {
        id: application.id,
        status: application.status,
        created_at: application.created_at,
        updated_at: application.updated_at,
        form_data: application.application_data,
      },
      applicant: application.user,
      documents: applicationDocuments.map(doc => ({
        name: doc.name,
        type: doc.mime_type,
        url: doc.blob_url || `/api/documents?id=${doc.id}`,
      })),
    };

    // Set headers for file download
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('Content-Disposition', `attachment; filename="application-${applicationId}.json"`);

    // Return the data as a downloadable JSON file
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers
    });
  } catch (error) {
    console.error('[EXPORT_APPLICATION]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
