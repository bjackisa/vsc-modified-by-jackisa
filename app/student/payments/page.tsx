'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';
import PaymentStatus from '@/components/student/PaymentStatus';

export default function StudentPaymentsPage() {
  const { user, isLoaded } = useUser();
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      fetchUserApplication();
    }
  }, [isLoaded, user]);

  const fetchUserApplication = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/applications/user');
      
      if (!response.ok) {
        throw new Error('Failed to fetch application');
      }
      
      const data = await response.json();
      
      if (data.applications && data.applications.length > 0) {
        setApplicationId(data.applications[0].id);
      }
    } catch (error) {
      console.error('Error fetching application:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please sign in to view your payment information.</p>
        </div>
      </div>
    );
  }

  if (!applicationId) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">No Application Found</h2>
          <p className="text-gray-600">You need to submit an application before you can manage payments.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Payment Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Payment Instructions</h2>
            <div className="prose max-w-none">
              <p>
                Please follow these steps to complete your payments:
              </p>
              <ol className="list-decimal pl-5 space-y-2 mt-2">
                <li>Check the payment status for each fee type</li>
                <li>Contact the administrator for payment account details</li>
                <li>Make your payment through bank transfer or other specified method</li>
                <li>Upload your payment receipt</li>
                <li>Wait for confirmation from the administrator</li>
              </ol>
              <p className="mt-4 text-sm text-gray-600">
                Note: Your payment status will be updated by the administrator after verification.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Payment Support</h2>
            <p className="text-gray-600">
              If you have any questions or need assistance with your payments, please contact our support team:
            </p>
            <div className="mt-4">
              <p className="text-sm">Email: <a href="mailto:support@example.com" className="text-blue-600 hover:text-blue-800">support@example.com</a></p>
              <p className="text-sm">Phone: +1 (234) 567-8900</p>
            </div>
          </div>
        </div>

        <div className="md:col-span-1">
          <PaymentStatus applicationId={applicationId} />
        </div>
      </div>
    </div>
  );
}
