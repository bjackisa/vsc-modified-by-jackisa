import { requireSuperAdmin } from '@/lib/admin-auth';
import Link from 'next/link';
import AddUserForm from './add-user-form';

export default async function AddUserPage() {
  // Ensure user is authenticated as super admin
  await requireSuperAdmin();

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/users"
          className="text-blue-600 hover:text-blue-800 transition-colors"
        >
          ← Back to Users
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">Add New User</h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        <AddUserForm />
      </div>
    </div>
  );
}
