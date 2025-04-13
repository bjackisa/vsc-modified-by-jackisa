import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { payments, applications, PaymentType } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { getAdminSession } from '@/lib/admin-auth';

// Get payments for an application
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('applicationId');

    if (!applicationId) {
      return NextResponse.json({ success: false, error: 'Application ID is required' }, { status: 400 });
    }

    // Check authentication - either the application owner or an admin can view payments
    const session = await auth();
    const adminSession = await getAdminSession();

    if (!session?.userId && !adminSession) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // If not admin, verify that the application belongs to the user
    if (!adminSession && session?.userId) {
      const userApplication = await db
        .select()
        .from(applications)
        .where(eq(applications.id, applicationId))
        .limit(1);

      if (userApplication.length === 0 || userApplication[0].user_id !== session.userId) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Get all payments for the application
    const paymentData = await db
      .select()
      .from(payments)
      .where(eq(payments.application_id, applicationId));

    // If no payments exist yet, create default payment records
    if (paymentData.length === 0) {
      try {
        const paymentTypes: PaymentType[] = ['application_fee', 'admission_fee', 'visa_fee', 'other'];

        const newPayments = [];

        for (const type of paymentTypes) {
          const payment = await db.insert(payments).values({
            application_id: applicationId,
            payment_type: type,
            status: 'not_updated',
            amount: type === 'application_fee' ? 100 :
                   type === 'admission_fee' ? 1000 :
                   type === 'visa_fee' ? 200 : 0,
            currency: 'USD',
          }).returning();

          newPayments.push(payment[0]);
        }

        return NextResponse.json({
          success: true,
          payments: newPayments
        });
      } catch (insertError) {
        console.error('[PAYMENTS_INSERT]', insertError);
        // Return empty array instead of failing if we can't create payments
        return NextResponse.json({
          success: true,
          payments: []
        });
      }
    }

    return NextResponse.json({
      success: true,
      payments: paymentData
    });
  } catch (error) {
    console.error('[PAYMENTS_GET]', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// Update payment status (admin only)
export async function POST(request: NextRequest) {
  try {
    // Only admins can update payment status
    const adminSession = await getAdminSession();

    if (!adminSession) {
      return NextResponse.json({ success: false, error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const data = await request.json();
    const { paymentId, status, amount, currency, accountDetails, notes } = data;

    if (!paymentId || !status) {
      return NextResponse.json({ success: false, error: 'Payment ID and status are required' }, { status: 400 });
    }

    // Validate status
    if (!['not_applicable', 'pending', 'paid', 'not_updated'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
    }

    try {
      // Update payment record
      const updatedPayment = await db
        .update(payments)
        .set({
          status: status,
          amount: amount ? parseFloat(amount) : undefined,
          currency: currency || 'USD',
          account_details: accountDetails || undefined,
          notes: notes || undefined,
          updated_by: adminSession.id,
          updated_at: new Date()
        })
        .where(eq(payments.id, paymentId))
        .returning();

      if (updatedPayment.length === 0) {
        return NextResponse.json({ success: false, error: 'Payment not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: 'Payment updated successfully',
        payment: updatedPayment[0]
      });
    } catch (dbError) {
      console.error('[PAYMENTS_DB_UPDATE]', dbError);
      return NextResponse.json({ success: false, error: 'Failed to update payment' }, { status: 500 });
    }
  } catch (error) {
    console.error('[PAYMENTS_UPDATE]', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
