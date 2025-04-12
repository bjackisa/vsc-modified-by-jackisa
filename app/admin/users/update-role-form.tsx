'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface UpdateRoleFormProps {
  userId: string;
  currentRole: string;
}

export default function UpdateRoleForm({ userId, currentRole = 'student' }: UpdateRoleFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [role, setRole] = useState<string>(() => currentRole);

  // Update role state when currentRole prop changes
  useEffect(() => {
    setRole(currentRole);
  }, [currentRole]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('role', role);

      const response = await fetch('/api/admin/users/update-role', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'User role updated successfully');
        router.refresh();
      } else {
        toast.error(data.error || 'Failed to update user role');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="mr-2 p-1 text-sm border rounded"
        disabled={isSubmitting}
      >
        <option value="student">Student</option>
        <option value="admin">Admin</option>
        <option value="super_admin">Super Admin</option>
      </select>
      <button
        type="submit"
        disabled={isSubmitting || role === currentRole}
        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? '...' : 'Update'}
      </button>
    </form>
  );
}
