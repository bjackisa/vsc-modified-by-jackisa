import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { payments, PaymentStatus, PaymentType } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { getAdminSession } from '@/lib/admin-auth';

// Update payment details (admin only)
export async function PATCH(request: NextRequest) {
  try {
    // Only admins can update payment details
    const adminSession = await getAdminSession();

    if (!adminSession) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized - Admin access required' 
      }, { status: 401 });
    }

    const data = await request.json();
    const { paymentId, status, amount, accountDetails, notes } = data;

    if (!paymentId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Payment ID is required' 
      }, { status: 400 });
    }

    // Validate status if provided
    if (status && !['not_applicable', 'pending', 'paid', 'not_updated'].includes(status)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid payment status' 
      }, { status: 400 });
    }

    // Update payment details
    const updatedPayment = await db
      .update(payments)
      .set({
        status: status as PaymentStatus,
        amount: amount,
        account_details: accountDetails,
        notes: notes,
        updated_by: adminSession.id,
        updated_at: new Date(),
      })
      .where(eq(payments.id, paymentId))
      .returning();

    if (updatedPayment.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Payment not found' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      payment: updatedPayment[0]
    });
  } catch (error) {
    console.error('[PAYMENTS_ADMIN_UPDATE]', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update payment details' 
    }, { status: 500 });
  }
}

// Get all payments (admin only)
export async function GET(request: NextRequest) {
  try {
    // Only admins can view all payments
    const adminSession = await getAdminSession();

    if (!adminSession) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized - Admin access required' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as PaymentStatus | null;
    const paymentType = searchParams.get('type') as PaymentType | null;

    let query = db.select().from(payments);

    if (status) {
      query = query.where(eq(payments.status, status));
    }

    if (paymentType) {
      query = query.where(eq(payments.payment_type, paymentType));
    }

    const allPayments = await query;

    return NextResponse.json({
      success: true,
      payments: allPayments
    });
  } catch (error) {
    console.error('[PAYMENTS_ADMIN_GET]', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch payments' 
    }, { status: 500 });
  }
} 