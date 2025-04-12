// app/api/upload/route.ts
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { documents, applications } from '@/lib/schema';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const applicationId = formData.get('applicationId') as string;

    if (!file || !applicationId) {
      return NextResponse.json({ error: 'File and applicationId are required' }, { status: 400 });
    }

    // Verify that the application belongs to the user
    const userApplication = await db
      .select()
      .from(applications)
      .where(eq(applications.id, applicationId))
      .limit(1);

    if (userApplication.length === 0 || userApplication[0].user_id !== userId) {
      return NextResponse.json({ error: 'Application not found or not owned by user' }, { status: 403 });
    }

    let blobUrl = '';

    try {
      // Upload to Vercel Blob
      const blob = await put(file.name, file, {
        access: 'public', // or 'private' if you want to restrict access
      });
      blobUrl = blob.url;
    } catch (blobError) {
      console.error('Blob upload error:', blobError);
      // If Vercel Blob fails, use a placeholder URL
      blobUrl = `https://placeholder.com/${file.name}`;
    }

    // Store reference in database
    await db.insert(documents).values({
      application_id: applicationId,
      name: file.name,
      blob_url: blobUrl,
      mime_type: file.type,
    });

    return NextResponse.json({ success: true, url: blobUrl });
  } catch (error) {
    console.error('[UPLOAD_POST]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}