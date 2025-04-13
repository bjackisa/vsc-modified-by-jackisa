'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface UpdateStatusFormProps {
  applicationId: string;
  currentStatus: string;
}

export default function UpdateStatusForm({ applicationId, currentStatus = 'pending' }: UpdateStatusFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<string>(() => currentStatus);

  // Update status state when currentStatus prop changes
  useEffect(() => {
    setStatus(currentStatus);
  }, [currentStatus]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('applicationId', applicationId);
      formData.append('status', status);

      const response = await fetch('/api/applications/update-status', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'Application status updated successfully');
        router.refresh();
      } else {
        toast.error(data.error || 'Failed to update application status');
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="mr-2 p-2 border rounded"
        disabled={isSubmitting}
      >
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>
      <button
        type="submit"
        disabled={isSubmitting || status === currentStatus}
        className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Updating...' : 'Update Status'}
      </button>
    </form>
  );
}
