import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  // Delete the admin token cookie
  cookies().delete('admin-token');
  
  return NextResponse.json({ 
    success: true, 
    message: 'Logged out successfully' 
  });
}
