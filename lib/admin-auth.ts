import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export async function getAdminSession() {
  console.log('[ADMIN_SESSION] Getting admin session');
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('admin-session')?.value;

  console.log('[ADMIN_SESSION] Session ID from cookie:', sessionId || 'Not found');

  if (!sessionId) {
    console.log('[ADMIN_SESSION] No session ID in cookies');
    return null;
  }

  try {
    console.log('[ADMIN_SESSION] Looking up user in database with ID:', sessionId);
    // Get user from database
    const dbUser = await db
      .select()
      .from(users)
      .where(eq(users.id, sessionId))
      .limit(1);

    console.log('[ADMIN_SESSION] Database query result:', dbUser.length ? 'User found' : 'No user found');

    if (dbUser.length === 0) {
      console.log('[ADMIN_SESSION] User not found in database');
      return null;
    }

    const user = dbUser[0];
    console.log('[ADMIN_SESSION] User found, role:', user.role);

    // Check if user is an admin
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      console.log('[ADMIN_SESSION] User is not an admin or super_admin');
      return null;
    }

    console.log('[ADMIN_SESSION] Valid admin session found for user:', user.email);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };
  } catch (error) {
    console.error('[ADMIN_SESSION] Error getting admin session:', error);
    return null;
  }
}

export async function requireAdmin() {
  const session = await getAdminSession();

  if (!session) {
    redirect('/admin-auth');
  }

  return session;
}

export async function requireSuperAdmin() {
  const session = await getAdminSession();

  if (!session || session.role !== 'super_admin') {
    redirect('/admin-auth');
  }

  return session;
}
