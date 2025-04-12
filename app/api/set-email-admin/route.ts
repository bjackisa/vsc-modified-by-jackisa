import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';

// Target admin email
const ADMIN_EMAIL = 'qudmeet@gmail.com';

export async function GET() {
  try {
    console.log(`Setting super_admin role for email ${ADMIN_EMAIL}`);

    // First, find the user in Clerk by email
    let clerkUser;
    try {
      const clerkUsers = await clerkClient.users.getUserList({
        emailAddress: [ADMIN_EMAIL],
      });

      if (clerkUsers.length === 0) {
        return NextResponse.json({ error: 'User not found in Clerk' }, { status: 404 });
      }

      clerkUser = clerkUsers[0];
      console.log(`Found user in Clerk with ID: ${clerkUser.id}`);
    } catch (clerkError) {
      console.error('Error finding user in Clerk:', clerkError);
      return NextResponse.json({ 
        error: 'Failed to find user in Clerk',
        details: clerkError
      }, { status: 500 });
    }

    // Update the user's metadata in Clerk
    try {
      await clerkClient.users.updateUser(clerkUser.id, {
        publicMetadata: {
          role: 'super_admin',
        },
      });
      
      console.log('Updated user role in Clerk');
    } catch (clerkError) {
      console.error('Error updating Clerk metadata:', clerkError);
      return NextResponse.json({ 
        error: 'Failed to update role in Clerk',
        details: clerkError
      }, { status: 500 });
    }

    // Check if user exists in our database
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, ADMIN_EMAIL))
      .limit(1);

    try {
      if (existingUser.length > 0) {
        // Update existing user
        await db
          .update(users)
          .set({ 
            role: 'super_admin',
            id: clerkUser.id // Ensure the ID matches Clerk
          })
          .where(eq(users.email, ADMIN_EMAIL));
        
        console.log('Updated user role in database');
      } else {
        // Create new user
        await db.insert(users).values({
          id: clerkUser.id,
          email: ADMIN_EMAIL,
          name: 'Super Admin',
          role: 'super_admin',
          created_at: new Date(),
        });
        
        console.log('Created user in database with super_admin role');
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Continue even if database update fails
    }

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
          <p>The account <strong>${ADMIN_EMAIL}</strong> has been updated with the super_admin role.</p>
          
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
