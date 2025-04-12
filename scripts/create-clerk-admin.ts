import * as dotenv from 'dotenv';
import { clerkClient } from '@clerk/nextjs/server';

dotenv.config({ path: '.env.local' });

// Super admin credentials
const SUPER_ADMIN_EMAIL = 'qudmeet@gmail.com';
const SUPER_ADMIN_PASSWORD = 'admin@qudmeet123';

async function main() {
  console.log(`Creating super admin user in Clerk with email ${SUPER_ADMIN_EMAIL}...`);

  try {
    // First check if the user already exists in Clerk
    const existingUsers = await clerkClient.users.getUserList({
      emailAddress: [SUPER_ADMIN_EMAIL],
    });

    if (existingUsers.length > 0) {
      console.log(`User already exists in Clerk with ID: ${existingUsers[0].id}`);
      
      // Update the user's metadata
      await clerkClient.users.updateUser(existingUsers[0].id, {
        publicMetadata: {
          role: 'super_admin',
        },
      });
      
      console.log('Updated user role to super_admin in Clerk');
    } else {
      // Create the user in Clerk
      const newUser = await clerkClient.users.createUser({
        emailAddress: [SUPER_ADMIN_EMAIL],
        password: SUPER_ADMIN_PASSWORD,
        publicMetadata: {
          role: 'super_admin',
        },
      });
      
      console.log(`Created new user in Clerk with ID: ${newUser.id}`);
    }
    
    console.log('Super admin setup complete!');
    console.log(`Email: ${SUPER_ADMIN_EMAIL}`);
    console.log(`Password: ${SUPER_ADMIN_PASSWORD}`);
    console.log('\nYou can now sign in with these credentials.');
  } catch (error) {
    console.error('Error creating/updating user in Clerk:', error);
  }
}

main();
