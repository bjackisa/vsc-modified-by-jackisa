import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';

// Target admin email
const ADMIN_EMAIL = 'qudmeet@gmail.com';

export async function GET() {
  try {
    console.log(`Setting super_admin role for email ${ADMIN_EMAIL} in database`);

    // Get the current user's ID from Clerk if available
    const { userId } = auth();
    const clerkUser = auth().user;
    const clerkEmail = clerkUser?.emailAddresses[0]?.emailAddress;

    console.log('Current Clerk user:', { userId, email: clerkEmail });

    // Determine which email to use (prefer the current user's email if it matches)
    const targetEmail = (clerkEmail === ADMIN_EMAIL) ? clerkEmail : ADMIN_EMAIL;

    // Check if user exists in our database
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, targetEmail))
      .limit(1);

    console.log('Existing user check:', existingUser);

    let result;
    if (existingUser.length > 0) {
      // Update existing user
      const updateData: any = { role: 'super_admin' };

      // If we have a Clerk ID and it's for the target email, use it
      if (userId && clerkEmail === targetEmail) {
        updateData.id = userId;
      }

      result = await db
        .update(users)
        .set(updateData)
        .where(eq(users.email, targetEmail));

      console.log('Updated user role in database:', result);
    } else {
      // Create new user with the Clerk user ID if available
      const newUser: any = {
        email: targetEmail,
        name: 'Super Admin',
        role: 'super_admin',
        created_at: new Date(),
      };

      // Use Clerk ID if available and matches the target email
      if (userId && clerkEmail === targetEmail) {
        newUser.id = userId;
      } else {
        newUser.id = 'manual-admin-' + Date.now();
      }

      console.log('Inserting new user:', newUser);
      result = await db.insert(users).values(newUser);
      console.log('Created user in database with super_admin role:', result);
    }

    // Verify the user was created/updated
    const verifyUser = await db
      .select()
      .from(users)
      .where(eq(users.email, ADMIN_EMAIL))
      .limit(1);

    console.log('Verification after update:', verifyUser);

    // Create a user-friendly HTML response
    const htmlResponse = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Role Set</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; max-width: 600px; margin: 0 auto; padding: 2rem; }
          .container { background-color: #f9fafb; border-radius: 0.5rem; padding: 2rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
          .success { color: #047857; }
          .steps { margin-top: 1.5rem; }
          .steps ol { padding-left: 1.5rem; }
          .btn { display: inline-block; background-color: #2563eb; color: white; padding: 0.5rem 1rem; border-radius: 0.375rem; text-decoration: none; margin-top: 1rem; }
          .btn:hover { background-color: #1d4ed8; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1 class="success">Admin Role Set Successfully</h1>
          <p>The account <strong>${ADMIN_EMAIL}</strong> has been updated with the super_admin role in the database.</p>

          <div class="steps">
            <h2>Next Steps</h2>
            <ol>
              <li>Sign out of your current session</li>
              <li>Sign in with the email: ${ADMIN_EMAIL}</li>
              <li>You should be redirected to the admin dashboard</li>
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
    console.error('Error setting admin role:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
