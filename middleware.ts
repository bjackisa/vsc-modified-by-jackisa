import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define public routes that don't require authentication
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
  '/setup-super-admin(.*)',
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
  '/api/admin-logout(.*)',
]);

// Simplified middleware for deployment
export default clerkMiddleware((auth, req) => {
  // For public routes, allow access
  if (publicRoutes(req)) {
    return NextResponse.next();
  }

  // For protected routes, use Clerk auth
  auth.protect();
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
