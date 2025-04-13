import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { payments, payment_receipts } from '@/lib/schema';

const sql = neon('postgresql://neondb_owner:npg_rK7TxODZ8IES@ep-broad-bar-a5om36nk-pooler.us-east-2.aws.neon.tech/neondb');
const db = drizzle(sql, { schema: { payments, payment_receipts } });

async function verifyTables() {
  try {
    console.log('Verifying database tables...');
    
    // Check payments table
    const paymentsResult = await db.select().from(payments).limit(1);
    console.log('Payments table exists:', paymentsResult !== undefined);
    
    // Check payment_receipts table
    const receiptsResult = await db.select().from(payment_receipts).limit(1);
    console.log('Payment receipts table exists:', receiptsResult !== undefined);
    
    console.log('Verification complete!');
  } catch (error) {
    console.error('Error verifying tables:', error);
  }
}

verifyTables(); 