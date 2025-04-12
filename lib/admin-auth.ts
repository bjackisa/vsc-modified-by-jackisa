import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export async function getAdminSession() {
  const cookieStore = cookies();
  const sessionId = cookieStore.get('admin-session')?.value;

  if (!sessionId) {
    return null;
  }

  try {
    // Get user from database
    const dbUser = await db
      .select()
      .from(users)
      .where(eq(users.id, sessionId))
      .limit(1);

    if (dbUser.length === 0) {
      return null;
    }

    const user = dbUser[0];

    // Check if user is an admin
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };
  } catch (error) {
    console.error('Error getting admin session:', error);
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
