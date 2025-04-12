import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';

// New admin details
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123'; // This is just for display, Clerk will handle actual auth

export async function GET() {
  try {
    console.log(`Creating new admin user with email ${ADMIN_EMAIL}`);

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, ADMIN_EMAIL))
      .limit(1);

    console.log('Existing user check:', existingUser);

    let result;
    let message;
    
    if (existingUser.length > 0) {
      // Update existing user to admin
      result = await db
        .update(users)
        .set({ 
          role: 'super_admin',
          name: 'New Admin User',
        })
        .where(eq(users.email, ADMIN_EMAIL));
      
      message = 'Updated existing user to super_admin role';
      console.log(message, result);
    } else {
      // Create new admin user
      const newUser = {
        id: 'new-admin-' + Date.now(),
        email: ADMIN_EMAIL,
        name: 'New Admin User',
        role: 'super_admin',
        created_at: new Date(),
      };

      console.log('Creating new admin user:', newUser);
      result = await db.insert(users).values(newUser);
      message = 'Created new admin user with super_admin role';
      console.log(message, result);
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
        <title>New Admin Created</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; max-width: 600px; margin: 0 auto; padding: 2rem; }
          .container { background-color: #f9fafb; border-radius: 0.5rem; padding: 2rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
          .success { color: #047857; }
          .credentials { background-color: #ecfdf5; padding: 1rem; border-radius: 0.375rem; margin: 1rem 0; }
          .steps { margin-top: 1.5rem; }
          .steps ol { padding-left: 1.5rem; }
          .btn { display: inline-block; background-color: #2563eb; color: white; padding: 0.5rem 1rem; border-radius: 0.375rem; text-decoration: none; margin-top: 1rem; }
          .btn:hover { background-color: #1d4ed8; }
          .warning { color: #b91c1c; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1 class="success">New Admin User Created</h1>
          <p>${message}</p>
          
          <div class="credentials">
            <h2>Admin Credentials</h2>
            <p><strong>Email:</strong> ${ADMIN_EMAIL}</p>
            <p><strong>Password:</strong> ${ADMIN_PASSWORD}</p>
            <p class="warning">Note: You will need to sign up with these credentials in Clerk.</p>
          </div>
          
          <div class="steps">
            <h2>Next Steps</h2>
            <ol>
              <li>Sign out if you are currently signed in</li>
              <li>Go to the sign-up page</li>
              <li>Sign up with the email: ${ADMIN_EMAIL}</li>
              <li>Use any password you want (Clerk handles authentication)</li>
              <li>After signing up, go to the dashboard</li>
              <li>You should be redirected to the admin dashboard</li>
            </ol>
          </div>
          
          <a href="/sign-up" class="btn">Go to Sign Up</a>
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
  } catch (error) {
    console.error('Error creating admin user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
