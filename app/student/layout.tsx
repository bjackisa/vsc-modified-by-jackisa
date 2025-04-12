import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Layout from '@/components/common/Layout';

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <Layout
      title="Student Portal"
      isStudent={true}
      showAuth={false}
    >
      {children}
    </Layout>
  );
}
