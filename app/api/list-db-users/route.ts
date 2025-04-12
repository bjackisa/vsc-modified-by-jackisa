import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';

export async function GET() {
  try {
    console.log('Listing all users in database');

    // Get all users from the database
    const allUsers = await db.select().from(users);
    
    console.log('All users:', allUsers);

    return NextResponse.json({ 
      success: true,
      users: allUsers
    });
  } catch (error) {
    console.error('Error listing users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
