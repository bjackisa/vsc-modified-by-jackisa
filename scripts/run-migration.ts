import { db } from '../lib/db';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import * as schema from '../lib/schema';
import * as dotenv from 'dotenv';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { join } from 'path';

dotenv.config({ path: '.env.local' });

async function main() {
  console.log('Running migrations...');
  
  try {
    // Use the same db instance from lib/db.ts
    await migrate(db, { migrationsFolder: join(process.cwd(), 'drizzle/migrations') });
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

main();
