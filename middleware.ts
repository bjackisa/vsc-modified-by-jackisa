import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';

const publicRoutes = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/dashboard',
  '/check-role',
  '/admin-tools',
  '/admin-login',
  '/admin-setup',
  '/admin-auth',
  '/direct-admin(.*)',
  '/setup-clerk-admin(.*)',
  '/api/admin/direct-setup(.*)',
  '/api/admin/create-clerk-admin(.*)',
  '/api/admin/setup-super-admin(.*)',
  '/api/admin/auth/(.*)',
  '/api/set-admin-role(.*)',
  '/api/set-email-admin(.*)',
  '/api/check-db-role(.*)',
  '/api/set-db-admin(.*)',
  '/api/list-db-users(.*)',
  '/api/sync-user-id(.*)',
  '/api/create-new-admin(.*)',
  '/api/update-admin-id(.*)',
  '/api/admin-auth(.*)',
  '/api/admin-logout(.*)'
]);

const adminRoutes = createRouteMatcher(['/admin(.*)']);
const superAdminRoutes = createRouteMatcher(['/super-admin(.*)']);

// Admin email addresses
const ADMIN_EMAILS = ['qudmeet@gmail.com', 'admin@example.com'];

// Helper function to check if a user is an admin based on database
async function checkIfAdmin(auth: any) {
  try {
    if (!auth.userId || !auth.user) {
      return false;
    }

    const email = auth.user.emailAddresses[0]?.emailAddress;
    if (!email) {
      return false;
    }

    // Fast path: check if email is in the admin list
    if (ADMIN_EMAILS.includes(email)) {
      console.log(`Admin email detected: ${email}`);
      return true;
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

// Helper function to get user role from database
async function getUserRole(auth: any) {
  try {
    if (!auth.userId || !auth.user) {
      return null;
    }

    const email = auth.user.emailAddresses[0]?.emailAddress;
    if (!email) {
      return null;
    }

    // Fast path: check if email is in the admin list
    if (ADMIN_EMAILS.includes(email)) {
      console.log(`Admin email detected: ${email}`);
      return 'super_admin';
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

export default clerkMiddleware(async (auth: any, req: NextRequest) => {
  // Check for admin session cookie
  const adminSession = req.cookies.get('admin-session')?.value;
  const adminRole = req.cookies.get('admin-role')?.value;

  // If admin session exists and we're on the homepage, redirect to admin dashboard
  if (adminSession && adminRole && req.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/admin/dashboard', req.url));
  }

  // Handle role-based redirects after sign-in with Clerk
  if (req.nextUrl.pathname === '/' && auth.userId) {
    try {
      const isAdmin = await checkIfAdmin(auth);

      // Redirect admin users to admin dashboard
      if (isAdmin) {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url));
      }

      // Redirect regular users (students) to student dashboard
      return NextResponse.redirect(new URL('/student/dashboard', req.url));
    } catch (error) {
      console.error('Error in middleware redirect:', error);
      // Default to student dashboard if there's an error
      return NextResponse.redirect(new URL('/student/dashboard', req.url));
    }
  }

  // Handle protected routes
  if (!publicRoutes(req)) {
    // Check for admin session for admin routes
    if (adminRoutes(req)) {
      const adminSession = req.cookies.get('admin-session')?.value;
      const adminRole = req.cookies.get('admin-role')?.value;

      // If admin session exists, allow access
      if (adminSession && (adminRole === 'admin' || adminRole === 'super_admin')) {
        return NextResponse.next();
      }

      // If no valid admin session, use Clerk auth
      auth.protect();

      try {
        // For admin routes, check database role
        const isAdmin = await checkIfAdmin(auth);
        if (!isAdmin) {
          return NextResponse.redirect(new URL('/', req.url));
        }
      } catch (error) {
        console.error('Error checking admin permissions:', error);
        return NextResponse.redirect(new URL('/', req.url));
      }
    } else {
      // For non-admin protected routes, use Clerk auth
      auth.protect();
    }

    // For super admin routes, check database role
    if (superAdminRoutes(req)) {
      try {
        const role = await getUserRole(auth);
        if (role !== 'super_admin') {
          return NextResponse.redirect(new URL('/', req.url));
        }
      } catch (error) {
        console.error('Error checking super admin permissions:', error);
        return NextResponse.redirect(new URL('/', req.url));
      }
    }
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
