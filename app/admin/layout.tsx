// import { redirect } from 'next/navigation';
import Link from 'next/link';
import AdminLogout from '@/components/admin-logout';
import { requireAdmin } from '@/lib/admin-auth';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if user is authenticated as admin
  const admin = await requireAdmin();
  const role = admin.role;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-2xl font-bold text-gray-800">
              Admin Portal
            </Link>
            <nav className="hidden md:flex ml-8">
              <ul className="flex gap-6">
                <li>
                  <Link
                    href="/admin/dashboard"
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/applications"
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Applications
                  </Link>
                </li>
                {role === 'super_admin' && (
                  <li>
                    <Link
                      href="/admin/users"
                      className="text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      Users
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
          </div>
          <AdminLogout />
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} Admission Portal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
