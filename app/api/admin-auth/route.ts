import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { sign, verify } from 'jsonwebtoken';

// Secret key for JWT signing - in production, use environment variables
const JWT_SECRET = 'admin-secret-key-change-in-production';

// Admin credentials - in production, store securely and use environment variables
const ADMIN_CREDENTIALS = [
  { email: 'admin@example.com', password: 'admin123' },
  { email: 'qudmeet@gmail.com', password: 'admin123' }
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate credentials
    const isValidCredential = ADMIN_CREDENTIALS.some(
      cred => cred.email === email && cred.password === password
    );

    if (!isValidCredential) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid credentials' 
      }, { status: 401 });
    }

    // Check if user exists in database
    let dbUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    // If user doesn't exist, create them
    if (dbUser.length === 0) {
      const newUser = {
        id: `admin-${Date.now()}`,
        email: email,
        name: 'Admin User',
        role: 'super_admin',
        created_at: new Date(),
      };

      await db.insert(users).values(newUser);
      
      // Fetch the newly created user
      dbUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
    } 
    // If user exists but is not admin, update their role
    else if (dbUser[0].role !== 'admin' && dbUser[0].role !== 'super_admin') {
      await db
        .update(users)
        .set({ role: 'super_admin' })
        .where(eq(users.email, email));
      
      // Refresh user data
      dbUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
    }

    // Create JWT token
    const token = sign(
      { 
        id: dbUser[0].id,
        email: dbUser[0].email,
        role: dbUser[0].role,
        name: dbUser[0].name,
        authMethod: 'direct'
      }, 
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set cookie
    cookies().set({
      name: 'admin-token',
      value: token,
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
      sameSite: 'lax',
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Login successful',
      user: {
        id: dbUser[0].id,
        email: dbUser[0].email,
        name: dbUser[0].name,
        role: dbUser[0].role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}

// Verify admin token
export async function GET() {
  try {
    const token = cookies().get('admin-token')?.value;
    
    if (!token) {
      return NextResponse.json({ 
        authenticated: false, 
        message: 'No token found' 
      });
    }

    try {
      const decoded = verify(token, JWT_SECRET) as any;
      
      // Check if user still exists in database
      const dbUser = await db
        .select()
        .from(users)
        .where(eq(users.id, decoded.id))
        .limit(1);
      
      if (dbUser.length === 0) {
        cookies().delete('admin-token');
        return NextResponse.json({ 
          authenticated: false, 
          message: 'User not found in database' 
        });
      }

      return NextResponse.json({ 
        authenticated: true, 
        user: {
          id: dbUser[0].id,
          email: dbUser[0].email,
          name: dbUser[0].name,
          role: dbUser[0].role
        }
      });
    } catch (verifyError) {
      cookies().delete('admin-token');
      return NextResponse.json({ 
        authenticated: false, 
        message: 'Invalid token' 
      });
    }
  } catch (error) {
    console.error('Error verifying admin token:', error);
    return NextResponse.json({ 
      authenticated: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}

// Logout
export async function DELETE() {
  cookies().delete('admin-token');
  return NextResponse.json({ 
    success: true, 
    message: 'Logged out successfully' 
  });
}
