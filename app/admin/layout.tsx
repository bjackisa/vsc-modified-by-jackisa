import { requireAdmin } from '@/lib/admin-auth';
import Layout from '@/components/common/Layout';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if user is authenticated as admin
  const admin = await requireAdmin();
  const role = admin.role;

  return (
    <Layout
      title="Admin Portal"
      isAdmin={true}
      role={role}
      showAuth={false}
    >
      {children}
    </Layout>
  );
}
