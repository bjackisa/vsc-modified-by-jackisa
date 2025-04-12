import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function isUserAdmin() {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return false;
    }

    // Get user from Clerk
    const user = auth().user;
    if (!user) {
      return false;
    }

    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) {
      return false;
    }

    // Check if user exists in our database and is an admin
    const dbUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (dbUser.length === 0) {
      return false;
    }

    // Check if user has admin or super_admin role
    return dbUser[0].role === 'admin' || dbUser[0].role === 'super_admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

export async function getUserRole() {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return null;
    }

    // Get user from Clerk
    const user = auth().user;
    if (!user) {
      return null;
    }

    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) {
      return null;
    }

    // Check if user exists in our database
    const dbUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (dbUser.length === 0) {
      return null;
    }

    return dbUser[0].role;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}
