import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../lib/schema';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Replace this with your Clerk user ID
const CLERK_USER_ID = 'user_2vZaDxS9u7LZsBcz2nr7mZdSNIk'; // This should be your actual Clerk user ID

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql, { schema });

  console.log(`Setting admin role for user ${CLERK_USER_ID}...`);
  
  try {
    // Check if user exists
    const existingUser = await sql`
      SELECT * FROM users WHERE id = ${CLERK_USER_ID}
    `;

    if (existingUser.length === 0) {
      console.log('User not found. Creating user with admin role...');
      await sql`
        INSERT INTO users (id, email, name, role, created_at)
        VALUES (${CLERK_USER_ID}, 'admin@example.com', 'Admin User', 'admin', NOW())
      `;
      console.log('User created with admin role!');
    } else {
      console.log('User found. Updating role to admin...');
      await sql`
        UPDATE users SET role = 'admin' WHERE id = ${CLERK_USER_ID}
      `;
      console.log('User role updated to admin!');
    }
    
    // Verify the change
    const updatedUser = await sql`
      SELECT * FROM users WHERE id = ${CLERK_USER_ID}
    `;
    
    console.log('Updated user:', updatedUser[0]);
  } catch (error) {
    console.error('Error setting admin role:', error);
    process.exit(1);
  }
}

main();
