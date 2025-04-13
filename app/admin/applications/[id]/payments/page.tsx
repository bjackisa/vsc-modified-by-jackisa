import { db } from '@/lib/db';
import { applications, users } from '@/lib/schema';
import { requireAdmin } from '@/lib/admin-auth';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import PaymentManager from '@/components/admin/PaymentManager';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function ApplicationPaymentsPage({ params }: PageProps) {
  // Ensure user is admin
  await requireAdmin();

  // Ensure params is properly awaited
  const { id } = params;
  const applicationId = id;

  // Fetch application with user info
  const applicationData = await db
    .select({
      id: applications.id,
      status: applications.status,
      application_data: applications.application_data,
      created_at: applications.created_at,
      user: users,
    })
    .from(applications)
    .where(eq(applications.id, applicationId))
    .leftJoin(users, eq(applications.user_id, users.id))
    .limit(1);

  if (applicationData.length === 0) {
    notFound();
  }

  const application = applicationData[0];

  return (
    <div className="container mx-auto py-6">
      <Link
        href="/admin/payments"
        className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to All Payments
      </Link>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">
          Payment Management for {application.application_data.fullName}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600">Email: {application.user.email}</p>
            <p className="text-sm text-gray-600">
              Applied for: {application.application_data.countryApplyingFor}
            </p>
            <p className="text-sm text-gray-600">
              Funding: {application.application_data.fundingType}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">
              Application Status:
              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                application.status === 'approved' ? 'bg-green-100 text-green-800' :
                application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
              </span>
            </p>
            <p className="text-sm text-gray-600">
              Application Date: {new Date(application.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <PaymentManager applicationId={applicationId} />
    </div>
  );
}
