import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { payments, applications } from '@/lib/schema';
import { eq } from 'drizzle-orm';

const sql = neon('postgresql://neondb_owner:npg_rK7TxODZ8IES@ep-broad-bar-a5om36nk-pooler.us-east-2.aws.neon.tech/neondb');
const db = drizzle(sql, { schema: { payments, applications } });

async function testPayment() {
  try {
    console.log('Testing payment functionality...');
    
    // Get an existing application
    const application = await db.select().from(applications).limit(1);
    
    if (application.length === 0) {
      console.log('No applications found. Please create an application first.');
      return;
    }
    
    const applicationId = application[0].id;
    console.log('Using application:', applicationId);
    
    // Create a test payment
    const payment = await db.insert(payments).values({
      application_id: applicationId,
      payment_type: 'application_fee',
      status: 'pending',
      amount: '100',
      currency: 'USD',
    }).returning();
    
    console.log('Payment created successfully:', payment[0]);
    
    // Clean up
    await db.delete(payments).where(eq(payments.id, payment[0].id));
    console.log('Test payment cleaned up');
    
  } catch (error) {
    console.error('Error testing payment:', error);
  }
}

testPayment(); 