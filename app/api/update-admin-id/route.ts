import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';

// Target admin email
const ADMIN_EMAIL = 'admin@example.com';

export async function GET() {
  try {
    // Get the current user's ID from Clerk
    const { userId } = auth();
    const clerkUser = auth().user;
    
    if (!userId || !clerkUser) {
      return NextResponse.json({ 
        success: false,
        message: 'Not authenticated'
      }, { status: 401 });
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress;
    
    if (!email) {
      return NextResponse.json({ 
        success: false,
        message: 'No email address found'
      }, { status: 400 });
    }

    console.log(`Checking if user ${email} (${userId}) is the admin user`);

    // Only proceed if this is the admin email
    if (email !== ADMIN_EMAIL) {
      return NextResponse.json({ 
        success: false,
        message: 'This API is only for updating the admin user ID'
      }, { status: 403 });
    }

    // Check if admin user exists in our database
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, ADMIN_EMAIL))
      .limit(1);

    console.log('Existing admin user check:', existingUser);

    if (existingUser.length > 0) {
      // Update the admin user's ID to match Clerk
      const result = await db
        .update(users)
        .set({ 
          id: userId,
          role: 'super_admin', // Ensure admin role is set
        })
        .where(eq(users.email, ADMIN_EMAIL));
      
      console.log('Updated admin user ID in database:', result);
      
      // Verify the update
      const verifyUser = await db
        .select()
        .from(users)
        .where(eq(users.email, ADMIN_EMAIL))
        .limit(1);
      
      console.log('Admin user after update:', verifyUser);
      
      // Create a user-friendly HTML response
      const htmlResponse = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Admin ID Updated</title>
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
            <h1 class="success">Admin ID Updated Successfully</h1>
            <p>Your Clerk ID has been synchronized with the database admin user.</p>
            
            <div class="steps">
              <h2>Next Steps</h2>
              <ol>
                <li>Go to the dashboard</li>
                <li>You should be redirected to the admin dashboard</li>
              </ol>
            </div>
            
            <a href="/dashboard" class="btn">Go to Dashboard</a>
            <a href="/admin-tools" class="btn" style="margin-left: 0.5rem;">Admin Tools</a>
          </div>
        </body>
        </html>
      `;
      
      return new NextResponse(htmlResponse, {
        headers: {
          'Content-Type': 'text/html',
        },
      });
    } else {
      return NextResponse.json({ 
        success: false,
        message: 'Admin user not found in database'
      }, { status: 404 });
    }
  } catch (error) {
    console.error('Error updating admin ID:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      details: error
    }, { status: 500 });
  }
}
