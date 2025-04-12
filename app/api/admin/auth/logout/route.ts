import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  // Clear the admin session cookies
  const cookieStore = cookies();
  cookieStore.delete('admin-session');
  cookieStore.delete('admin-role');

  return NextResponse.json({
    success: true,
    message: 'Logged out successfully'
  });
}
