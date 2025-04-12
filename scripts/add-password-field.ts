import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../lib/schema';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql, { schema });

  console.log('Adding password field to users table...');

  try {
    // Add password column if it doesn't exist
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS password TEXT;
    `;

    console.log('Password field added successfully!');
  } catch (error) {
    console.error('Error adding password field:', error);
    process.exit(1);
  }
}

main();
