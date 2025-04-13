import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-http';

dotenv.config({ path: '.env.local' });

const sql = neon('postgresql://neondb_owner:npg_rK7TxODZ8IES@ep-broad-bar-a5om36nk-pooler.us-east-2.aws.neon.tech/neondb');

async function createTables() {
  try {
    console.log('Creating payment tables...');
    
    // Create payments table
    await sql`
      CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        application_id TEXT REFERENCES applications(id) ON DELETE CASCADE,
        payment_type TEXT NOT NULL,
        status TEXT DEFAULT 'not_updated' NOT NULL,
        amount DECIMAL(10, 2) DEFAULT 0,
        currency TEXT DEFAULT 'USD',
        account_details TEXT,
        notes TEXT,
        updated_by TEXT REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('Payments table created');
    
    // Create payment_receipts table
    await sql`
      CREATE TABLE IF NOT EXISTS payment_receipts (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        payment_id TEXT REFERENCES payments(id) ON DELETE CASCADE,
        blob_url TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        name TEXT NOT NULL,
        uploaded_by TEXT REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('Payment receipts table created');
    
    console.log('All tables created successfully!');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
}

createTables();
