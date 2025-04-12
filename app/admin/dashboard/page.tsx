import { db } from '@/lib/db';
import { applications, documents, users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import UpdateStatusForm from '../applications/update-status-form';

export default async function AdminDashboard() {
  const applicationData = await db
    .select({
      id: applications.id,
      status: applications.status,
      application_data: applications.application_data,
      user: users,
      documents: documents
    })
    .from(applications)
    .leftJoin(users, eq(applications.user_id, users.id))
    .leftJoin(documents, eq(documents.application_id, applications.id));

  // This function would need to be moved to a client component
  // Server components can't have interactive functions

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Applications Dashboard</h1>
      <div className="space-y-6">
        {applicationData.map((application) => (
          <div key={application.id} className="border rounded-lg p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold">
                  {application.application_data?.fullName || 'No name provided'}
                </h2>
                <p className="text-gray-600">
                  Status: {application.status}
                </p>
              </div>
              <UpdateStatusForm
                applicationId={application.id}
                currentStatus={application.status}
              />
            </div>

            <div className="mt-4">
              <h3 className="font-semibold mb-2">Documents</h3>
              <div className="space-y-2">
                {Array.isArray(application.documents) ? application.documents.map((doc: typeof documents.$inferSelect) => (
                  <div key={doc.id} className="flex items-center justify-between">
                    <span>{doc.name}</span>
                    <a
                      href={doc.blob_url || `/api/documents?id=${doc.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      Download
                    </a>
                  </div>
                )) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}




