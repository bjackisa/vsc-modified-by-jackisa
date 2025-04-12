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
    // First check if the user exists in Clerk
    let clerkUserId = null;

    try {
      const existingUsers = await clerkClient.users.getUserList({
        emailAddress: [SUPER_ADMIN_EMAIL],
      });

      if (existingUsers.length > 0) {
        clerkUserId = existingUsers[0].id;
        console.log(`User already exists in Clerk with ID: ${clerkUserId}`);

        // Update the user's metadata
        await clerkClient.users.updateUser(clerkUserId, {
          publicMetadata: {
            role: 'super_admin',
          },
        });

        // Force a reload of the session
        await clerkClient.sessions.getSessionList({
          userId: clerkUserId,
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

        clerkUserId = newUser.id;
        console.log(`Created new user in Clerk with ID: ${newUser.id}`);
      }
    } catch (error) {
      console.error('Error with Clerk API:', error);
      return NextResponse.json({ error: 'Failed to create/update user in Clerk' }, { status: 500 });
    }

    // Now check if the user exists in our database
    const existingDbUser = await db
      .select()
      .from(users)
      .where(eq(users.email, SUPER_ADMIN_EMAIL))
      .limit(1);

    if (existingDbUser.length > 0) {
      // Update the user in our database
      await db
        .update(users)
        .set({
          role: 'super_admin',
          id: clerkUserId // Ensure the ID matches Clerk
        })
        .where(eq(users.email, SUPER_ADMIN_EMAIL));

      console.log('Updated user in database');
    } else {
      // Create the user in our database
      await db.insert(users).values({
        id: clerkUserId,
        email: SUPER_ADMIN_EMAIL,
        name: 'Super Admin',
        role: 'super_admin',
        created_at: new Date(),
      });

      console.log('Created user in database');
    }

    // Create a user-friendly HTML response
    const htmlResponse = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Super Admin Setup</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; max-width: 600px; margin: 0 auto; padding: 2rem; }
          .container { background-color: #f9fafb; border-radius: 0.5rem; padding: 2rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
          .success { color: #047857; }
          .credentials { background-color: #ecfdf5; padding: 1rem; border-radius: 0.375rem; margin: 1rem 0; }
          .steps { margin-top: 1.5rem; }
          .steps ol { padding-left: 1.5rem; }
          .btn { display: inline-block; background-color: #2563eb; color: white; padding: 0.5rem 1rem; border-radius: 0.375rem; text-decoration: none; margin-top: 1rem; }
          .btn:hover { background-color: #1d4ed8; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1 class="success">Super Admin Setup Complete</h1>
          <p>The super admin account has been successfully created/updated.</p>

          <div class="credentials">
            <h2>Admin Credentials</h2>
            <p><strong>Email:</strong> ${SUPER_ADMIN_EMAIL}</p>
            <p><strong>Password:</strong> ${SUPER_ADMIN_PASSWORD}</p>
          </div>

          <div class="steps">
            <h2>Next Steps</h2>
            <ol>
              <li>Sign out if you are currently signed in</li>
              <li>Sign in with these credentials</li>
              <li>You should be redirected to the admin dashboard</li>
              <li>If not, check your role settings</li>
            </ol>
          </div>

          <a href="/sign-in" class="btn">Go to Sign In</a>
          <a href="/check-role" class="btn" style="margin-left: 0.5rem;">Check Role</a>
        </div>
      </body>
      </html>
    `;

    return new NextResponse(htmlResponse, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
