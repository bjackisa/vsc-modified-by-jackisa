import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../lib/schema';
import * as dotenv from 'dotenv';
import { eq } from 'drizzle-orm';
import { clerkClient } from '@clerk/nextjs/server';

dotenv.config({ path: '.env.local' });

// Super admin credentials
const SUPER_ADMIN_EMAIL = 'qudmeet@gmail.com';
const SUPER_ADMIN_PASSWORD = 'admin@qudmeet123'; // This will be used with Clerk

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql, { schema });

  console.log(`Creating super admin user with email ${SUPER_ADMIN_EMAIL}...`);
  
  try {
    // Check if user exists in the database
    const existingUser = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, SUPER_ADMIN_EMAIL))
      .limit(1);

    let userId = '';

    if (existingUser.length === 0) {
      console.log('User not found in database. Creating super admin user...');
      
      // First, try to find the user in Clerk
      try {
        const clerkUsers = await clerkClient.users.getUserList({
          emailAddress: [SUPER_ADMIN_EMAIL],
        });

        if (clerkUsers.length > 0) {
          userId = clerkUsers[0].id;
          console.log(`Found user in Clerk with ID: ${userId}`);
          
          // Update the user's metadata in Clerk
          await clerkClient.users.updateUser(userId, {
            publicMetadata: {
              role: 'super_admin',
            },
          });
          console.log('Updated user role to super_admin in Clerk');
        } else {
          console.log('User not found in Clerk. Please create the user in Clerk first.');
          console.log('After creating the user, run this script again.');
          process.exit(1);
        }
      } catch (error) {
        console.error('Error with Clerk API:', error);
        console.log('Continuing with database update only...');
        
        // Generate a placeholder user ID if we can't get it from Clerk
        userId = `user_${Math.random().toString(36).substring(2, 15)}`;
      }

      // Insert the user into our database
      await db.insert(schema.users).values({
        id: userId,
        email: SUPER_ADMIN_EMAIL,
        name: 'Super Admin',
        role: 'super_admin',
        created_at: new Date(),
      });
      console.log('Super admin user created in database!');
    } else {
      userId = existingUser[0].id;
      console.log('User found in database. Updating role to super_admin...');
      
      // Update the user's role in our database
      await db
        .update(schema.users)
        .set({ role: 'super_admin' })
        .where(eq(schema.users.email, SUPER_ADMIN_EMAIL));
      
      // Try to update the user's metadata in Clerk
      try {
        const clerkUsers = await clerkClient.users.getUserList({
          emailAddress: [SUPER_ADMIN_EMAIL],
        });

        if (clerkUsers.length > 0) {
          await clerkClient.users.updateUser(clerkUsers[0].id, {
            publicMetadata: {
              role: 'super_admin',
            },
          });
          console.log('Updated user role to super_admin in Clerk');
        }
      } catch (error) {
        console.error('Error updating Clerk metadata:', error);
      }
      
      console.log('User role updated to super_admin in database!');
    }
    
    // Verify the change
    const updatedUser = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, SUPER_ADMIN_EMAIL))
      .limit(1);
    
    console.log('Updated user in database:', updatedUser[0]);
    console.log('\nSuper admin user setup complete!');
    console.log(`Email: ${SUPER_ADMIN_EMAIL}`);
    console.log('Password: [The password you provided]');
    console.log('\nYou can now sign in with these credentials.');
  } catch (error) {
    console.error('Error setting up super admin:', error);
    process.exit(1);
  }
}

main();
