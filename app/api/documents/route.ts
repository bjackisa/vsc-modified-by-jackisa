import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { documents, applications } from '@/lib/schema';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const applicationId = formData.get('applicationId') as string;

    if (!file || !applicationId) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Verify that the application belongs to the user
    const userApplication = await db
      .select()
      .from(applications)
      .where(eq(applications.id, applicationId))
      .limit(1);

    if (userApplication.length === 0 || userApplication[0].user_id !== userId) {
      return new NextResponse('Application not found or not owned by user', { status: 403 });
    }

    // Upload file to Vercel Blob (this should be done in the upload route)
    // Here we're just storing a placeholder URL
    const blobUrl = `https://example.com/${file.name}`; // This is just a placeholder

    const document = await db.insert(documents).values({
      application_id: applicationId,
      name: file.name,
      blob_url: blobUrl,
      mime_type: file.type,
    }).returning();

    return NextResponse.json(document[0]);
  } catch (error) {
    console.error('[DOCUMENTS_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('id');

    if (!documentId) {
      return new NextResponse('Document ID required', { status: 400 });
    }

    const document = await db
      .select()
      .from(documents)
      .where(eq(documents.id, documentId))
      .limit(1);

    if (document.length === 0) {
      return new NextResponse('Document not found', { status: 404 });
    }

    // Redirect to the blob URL instead of serving the content directly
    return NextResponse.redirect(document[0].blob_url);


  } catch (error) {
    console.error('[DOCUMENTS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}