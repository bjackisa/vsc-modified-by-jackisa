import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';

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

    console.log(`Syncing user ID for ${email} (Clerk ID: ${userId})`);

    // Check if user exists in our database
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    console.log('Existing user check:', existingUser);

    if (existingUser.length > 0) {
      // Update the user's ID to match Clerk
      const result = await db
        .update(users)
        .set({ 
          id: userId,
          role: 'super_admin', // Ensure admin role is set
        })
        .where(eq(users.email, email));
      
      console.log('Updated user ID in database:', result);
      
      // Verify the update
      const verifyUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      
      console.log('User after update:', verifyUser);
      
      return NextResponse.json({ 
        success: true,
        message: 'User ID synchronized successfully',
        user: verifyUser[0]
      });
    } else {
      // Create new user with Clerk ID
      const newUser = {
        id: userId,
        email: email,
        name: clerkUser.firstName ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim() : 'User',
        role: 'super_admin', // Set as admin
        created_at: new Date(),
      };

      console.log('Creating new user:', newUser);
      const result = await db.insert(users).values(newUser);
      console.log('Created user in database:', result);
      
      return NextResponse.json({ 
        success: true,
        message: 'New user created with Clerk ID',
        user: newUser
      });
    }
  } catch (error) {
    console.error('Error syncing user ID:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      details: error
    }, { status: 500 });
  }
}
