import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';

// Super admin credentials
const SUPER_ADMIN_EMAIL = 'qudmeet@gmail.com';
const SUPER_ADMIN_PASSWORD = 'admin@qudmeet123';

export async function GET() {
  try {
    console.log(`Creating super admin user in Clerk with email ${SUPER_ADMIN_EMAIL}...`);

    // First check if the user already exists in our database
    const existingDbUser = await db
      .select()
      .from(users)
      .where(eq(users.email, SUPER_ADMIN_EMAIL))
      .limit(1);

    let userId = existingDbUser.length > 0 ? existingDbUser[0].id : null;

    // Check if the user exists in Clerk
    try {
      const existingUsers = await clerkClient.users.getUserList({
        emailAddress: [SUPER_ADMIN_EMAIL],
      });

      if (existingUsers.length > 0) {
        console.log(`User already exists in Clerk with ID: ${existingUsers[0].id}`);
        userId = existingUsers[0].id;

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
          firstName: 'Super',
          lastName: 'Admin',
          publicMetadata: {
            role: 'super_admin',
          },
        });

        userId = newUser.id;
        console.log(`Created new user in Clerk with ID: ${newUser.id}`);
      }
    } catch (error) {
      console.error('Error with Clerk API:', error);
      return NextResponse.json({ error: 'Failed to create/update user in Clerk' }, { status: 500 });
    }

    // Update or create the user in our database
    if (existingDbUser.length > 0) {
      await db
        .update(users)
        .set({
          role: 'super_admin',
          id: userId // Ensure the ID matches Clerk
        })
        .where(eq(users.email, SUPER_ADMIN_EMAIL));

      console.log('Updated user in database');
    } else {
      await db.insert(users).values({
        id: userId,
        email: SUPER_ADMIN_EMAIL,
        name: 'Super Admin',
        role: 'super_admin',
        created_at: new Date(),
      });

      console.log('Created user in database');
    }

    return NextResponse.json({
      success: true,
      message: 'Super admin created/updated successfully',
      credentials: {
        email: SUPER_ADMIN_EMAIL,
        password: SUPER_ADMIN_PASSWORD
      }
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
