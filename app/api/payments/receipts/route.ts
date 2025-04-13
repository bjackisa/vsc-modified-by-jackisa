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
    const { userId } = auth();
    const adminSession = await getAdminSession();

    if (!userId && !adminSession) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // If not admin, verify that the payment belongs to the user's application
    if (!adminSession && userId) {
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

        if (paymentData.length === 0 || paymentData[0].application.user_id !== userId) {
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
    const { userId } = auth();

    if (!userId) {
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

      if (paymentData[0].application.user_id !== userId) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }

      try {
        // Upload file to Vercel Blob
        const blob = await put(`payment-receipts/${paymentId}/${file.name}`, file, {
          access: 'public',
        });

        try {
          // Store receipt in database
          const receipt = await db.insert(payment_receipts).values({
            payment_id: paymentId,
            name: file.name,
            blob_url: blob.url,
            mime_type: file.type,
            uploaded_by: userId,
          }).returning();

          // Update payment status to pending if it was not_updated
          const payment = paymentData[0].payment;
          if (payment.status === 'not_updated') {
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
            message: 'Receipt uploaded successfully',
            receipt: receipt[0],
          });
        } catch (dbError) {
          console.error('[RECEIPT_DB_INSERT]', dbError);
          return NextResponse.json({ success: false, error: 'Failed to save receipt to database' }, { status: 500 });
        }
      } catch (blobError) {
        console.error('[RECEIPT_BLOB_UPLOAD]', blobError);
        return NextResponse.json({ success: false, error: 'Failed to upload file' }, { status: 500 });
      }
    } catch (authError) {
      console.error('[RECEIPT_AUTH_CHECK]', authError);
      return NextResponse.json({ success: false, error: 'Failed to verify payment ownership' }, { status: 500 });
    }
  } catch (error) {
    console.error('[RECEIPT_UPLOAD]', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
