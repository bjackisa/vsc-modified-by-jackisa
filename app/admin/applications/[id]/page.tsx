import { db } from '@/lib/db';
import { applications, documents, users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { requireAdmin } from '@/lib/admin-auth';
import UpdateStatusForm from '../../applications/update-status-form';
import PrintButton from '../../applications/print-button';
import ExportButton from '../../applications/export-button';
import DocumentDownload from '../../applications/document-download';

export default async function ApplicationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // Ensure user is authenticated as admin
  await requireAdmin();

  const { id } = params;

  // Get application with user and documents
  const applicationData = await db
    .select({
      id: applications.id,
      status: applications.status,
      application_data: applications.application_data,
      user: users,
      created_at: applications.created_at,
      updated_at: applications.updated_at,
    })
    .from(applications)
    .where(eq(applications.id, id))
    .leftJoin(users, eq(applications.user_id, users.id))
    .limit(1);

  if (applicationData.length === 0) {
    notFound();
  }

  const application = applicationData[0];

  // Get documents for this application
  const applicationDocuments = await db
    .select()
    .from(documents)
    .where(eq(documents.application_id, id));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href="/admin/applications"
          className="text-blue-600 hover:text-blue-800 transition-colors"
        >
          ← Back to Applications
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-2xl font-bold">
              Application #{application.id.slice(0, 8)}
            </h1>
            <UpdateStatusForm
              applicationId={application.id}
              currentStatus={application.status}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-lg font-semibold mb-3">Application Details</h2>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="mb-2">
                  <span className="font-medium">Status:</span>{' '}
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    application.status === 'approved' ? 'bg-green-100 text-green-800' :
                    application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </span>
                </p>
                <p className="mb-2">
                  <span className="font-medium">Submitted:</span>{' '}
                  {application.created_at ? new Date(application.created_at).toISOString().split('T')[0] : 'N/A'}
                </p>
                <p className="mb-2">
                  <span className="font-medium">Last Updated:</span>{' '}
                  {application.updated_at ? new Date(application.updated_at).toISOString().split('T')[0] : 'N/A'}
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3">Applicant Information</h2>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="mb-2">
                  <span className="font-medium">Name:</span>{' '}
                  {application.user?.name || 'N/A'}
                </p>
                <p className="mb-2">
                  <span className="font-medium">Email:</span>{' '}
                  {application.user?.email || 'N/A'}
                </p>
                <p className="mb-2">
                  <span className="font-medium">User ID:</span>{' '}
                  {application.user?.id || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Application Form Data</h2>
            <div className="bg-gray-50 p-4 rounded-md">
              {application.application_data ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="mb-2">
                      <span className="font-medium">Full Name:</span>{' '}
                      {application.application_data.fullName}
                    </p>
                    <p className="mb-2">
                      <span className="font-medium">Email:</span>{' '}
                      {application.application_data.email}
                    </p>
                    <p className="mb-2">
                      <span className="font-medium">Phone:</span>{' '}
                      {application.application_data.phoneNumber}
                    </p>
                  </div>
                  <div>
                    <p className="mb-2">
                      <span className="font-medium">Address:</span>{' '}
                      {application.application_data.address}
                    </p>
                    <p className="mb-2">
                      <span className="font-medium">Education:</span>{' '}
                      {application.application_data.education}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No application data available</p>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">Documents</h2>
            {applicationDocuments.length > 0 ? (
              <div className="bg-gray-50 p-4 rounded-md">
                <ul className="divide-y divide-gray-200">
                  {applicationDocuments.map((doc) => (
                    <DocumentDownload
                      key={doc.id}
                      documentId={doc.id}
                      blobUrl={doc.blob_url}
                      name={doc.name}
                      mimeType={doc.mime_type}
                    />
                  ))}
                </ul>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-gray-500">No documents uploaded</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between mb-10">
        <PrintButton />
        <ExportButton applicationId={application.id} />
      </div>
    </div>
  );
}
