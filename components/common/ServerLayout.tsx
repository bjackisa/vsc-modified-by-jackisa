import { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import Layout from './Layout';

interface ServerLayoutProps {
  children: ReactNode;
  title?: string;
}

export default async function ServerLayout({ children, title }: ServerLayoutProps) {
  // Check for admin session
  const cookieStore = cookies();
  const adminSessionId = cookieStore.get('admin-session')?.value;
  const adminRole = cookieStore.get('admin-role')?.value;

  // If admin is logged in
  if (adminSessionId && adminRole) {
    return (
      <Layout
        title={title || 'Admin Portal'}
        isAdmin={true}
        role={adminRole}
        showAuth={false}
      >
        {children}
      </Layout>
    );
  }

  // Default layout for non-authenticated users
  return (
    <Layout
      title={title || 'Varsity Scholars Consult'}
      showAuth={true}
    >
      {children}
    </Layout>
  );
}
