import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { payments, payment_receipts, applications } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { put } from '@vercel/blob';
import { getAdminSession } from '@/lib/admin-auth';

// Get receipts for a payment
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');

    if (!paymentId) {
      return NextResponse.json({ success: false, error: 'Payment ID is required' }, { status: 400 });
    }

    // Check authentication - either the application owner or an admin can view receipts
    const session = await auth();
    const adminSession = await getAdminSession();

    if (!session.userId && !adminSession) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // If not admin, verify that the payment belongs to the user's application
    if (!adminSession && session.userId) {
      try {
        const paymentData = await db
          .select({
            payment: payments,
            application: applications,
          })
          .from(payments)
          .where(eq(payments.id, paymentId))
          .leftJoin(applications, eq(payments.application_id, applications.id))
          .limit(1);

        if (paymentData.length === 0 || !paymentData[0].application || paymentData[0].application.user_id !== session.userId) {
          return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }
      } catch (authError) {
        console.error('[RECEIPTS_AUTH_CHECK]', authError);
        return NextResponse.json({ success: false, error: 'Failed to verify authorization' }, { status: 500 });
      }
    }

    try {
      // Get all receipts for the payment
      const receipts = await db
        .select()
        .from(payment_receipts)
        .where(eq(payment_receipts.payment_id, paymentId));

      return NextResponse.json({
        success: true,
        receipts: receipts
      });
    } catch (dbError) {
      console.error('[RECEIPTS_DB_GET]', dbError);
      return NextResponse.json({ success: false, error: 'Failed to fetch receipts' }, { status: 500 });
    }
  } catch (error) {
    console.error('[RECEIPTS_GET]', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// Upload a receipt for a payment
export async function POST(request: NextRequest) {
  try {
    // Get the current user from Clerk
    const session = await auth();

    if (!session.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const paymentId = formData.get('paymentId') as string;

    if (!file || !paymentId) {
      return NextResponse.json({ success: false, error: 'File and payment ID are required' }, { status: 400 });
    }

    try {
      // Verify that the payment exists and belongs to the user's application
      const paymentData = await db
        .select({
          payment: payments,
          application: applications,
        })
        .from(payments)
        .where(eq(payments.id, paymentId))
        .leftJoin(applications, eq(payments.application_id, applications.id))
        .limit(1);

      if (paymentData.length === 0) {
        return NextResponse.json({ success: false, error: 'Payment not found' }, { status: 404 });
      }

      if (!paymentData[0].application || paymentData[0].application.user_id !== session.userId) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }

      // Upload file to Vercel Blob
      const blob = await put(`receipts/${paymentId}/${file.name}`, file, {
        access: 'public',
      });

      // Create receipt record
      const receipt = await db.insert(payment_receipts).values({
        payment_id: paymentId,
        blob_url: blob.url,
        mime_type: file.type,
        name: file.name,
        uploaded_by: session.userId,
      }).returning();

      // Update payment status to pending if it was not_updated
      if (paymentData[0].payment.status === 'not_updated') {
        await db
          .update(payments)
          .set({
            status: 'pending',
            updated_at: new Date(),
          })
          .where(eq(payments.id, paymentId));
      }

      return NextResponse.json({
        success: true,
        receipt: receipt[0]
      });
    } catch (error) {
      console.error('[RECEIPTS_UPLOAD]', error);
      return NextResponse.json({ success: false, error: 'Failed to upload receipt' }, { status: 500 });
    }
  } catch (error) {
    console.error('[RECEIPTS_POST]', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
