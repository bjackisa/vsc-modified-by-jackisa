import { db } from '@/lib/db';
import { applications, documents } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import DocumentDownload from '@/app/admin/applications/document-download';
import DateDisplay from '@/app/admin/applications/date-display';

export default async function StudentApplicationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // Ensure user is authenticated
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  const { id } = params;

  // Get application with documents
  const applicationData = await db
    .select()
    .from(applications)
    .where(eq(applications.id, id))
    .limit(1);

  if (applicationData.length === 0) {
    notFound();
  }

  const application = applicationData[0];

  // Verify that the application belongs to the current user
  if (application.user_id !== userId) {
    redirect('/student/dashboard');
  }

  // Get documents for this application
  const applicationDocuments = await db
    .select()
    .from(documents)
    .where(eq(documents.application_id, id));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href="/student/dashboard"
          className="text-blue-600 hover:text-blue-800 transition-colors"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-2xl font-bold">
              Application #{application.id.slice(0, 8)}
            </h1>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              application.status === 'approved' ? 'bg-green-100 text-green-800' : 
              application.status === 'rejected' ? 'bg-red-100 text-red-800' : 
              'bg-yellow-100 text-yellow-800'
            }`}>
              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
            </span>
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
                  <DateDisplay date={application.created_at} />
                </p>
                <p className="mb-2">
                  <span className="font-medium">Last Updated:</span>{' '}
                  <DateDisplay date={application.updated_at} />
                </p>
              </div>
            </div>
          </div>

          {/* Personal Information Section */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Personal Information</h2>
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
                    <p className="mb-2">
                      <span className="font-medium">Date of Birth:</span>{' '}
                      {application.application_data.dateOfBirth || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="mb-2">
                      <span className="font-medium">Address:</span>{' '}
                      {application.application_data.address}
                    </p>
                    <p className="mb-2">
                      <span className="font-medium">Country:</span>{' '}
                      {application.application_data.country || 'N/A'}
                    </p>
                    <p className="mb-2">
                      <span className="font-medium">State/Province:</span>{' '}
                      {application.application_data.stateProvince || 'N/A'}
                    </p>
                    <p className="mb-2">
                      <span className="font-medium">Passport/ID Number:</span>{' '}
                      {application.application_data.passportNumber || 'N/A'}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No personal information available</p>
              )}
            </div>
          </div>

          {/* Education Information - SSCE Details */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">SSCE Details</h2>
            <div className="bg-gray-50 p-4 rounded-md">
              {application.application_data ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="mb-2">
                      <span className="font-medium">Secondary School Name:</span>{' '}
                      {application.application_data.secondarySchoolName || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="mb-2">
                      <span className="font-medium">High School Grade:</span>{' '}
                      {application.application_data.secondarySchoolGrade || 'N/A'}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No SSCE details available</p>
              )}
            </div>
          </div>

          {/* Education Information - Bachelor Degree Details */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Bachelor Degree Details</h2>
            <div className="bg-gray-50 p-4 rounded-md">
              {application.application_data && (application.application_data.bachelorUniversityName || application.application_data.bachelorProgram || application.application_data.bachelorGrade) ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="mb-2">
                      <span className="font-medium">University Name:</span>{' '}
                      {application.application_data.bachelorUniversityName || 'N/A'}
                    </p>
                    <p className="mb-2">
                      <span className="font-medium">Program Offered:</span>{' '}
                      {application.application_data.bachelorProgram || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="mb-2">
                      <span className="font-medium">University Grade:</span>{' '}
                      {application.application_data.bachelorGrade || 'N/A'}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No bachelor degree details provided</p>
              )}
            </div>
          </div>

          {/* Education Information - Graduate/Master Details */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Graduate/Master Details</h2>
            <div className="bg-gray-50 p-4 rounded-md">
              {application.application_data && (application.application_data.graduateUniversityName || application.application_data.graduateProgram || application.application_data.graduateGrade) ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="mb-2">
                      <span className="font-medium">University Name:</span>{' '}
                      {application.application_data.graduateUniversityName || 'N/A'}
                    </p>
                    <p className="mb-2">
                      <span className="font-medium">Program Offered:</span>{' '}
                      {application.application_data.graduateProgram || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="mb-2">
                      <span className="font-medium">University Grade:</span>{' '}
                      {application.application_data.graduateGrade || 'N/A'}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No graduate/master details provided</p>
              )}
            </div>
          </div>

          {/* Application Details */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Application Details</h2>
            <div className="bg-gray-50 p-4 rounded-md">
              {application.application_data ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="mb-2">
                      <span className="font-medium">Country Applying For:</span>{' '}
                      {application.application_data.countryApplyingFor || 'N/A'}
                    </p>
                    <p className="mb-2">
                      <span className="font-medium">Funding Type:</span>{' '}
                      {application.application_data.fundingType || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="mb-2">
                      <span className="font-medium">Referral Source:</span>{' '}
                      {application.application_data.referralSource || 'N/A'}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No application details available</p>
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
        <Link
          href="/student/dashboard"
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          Back to Dashboard
        </Link>
        
        {application.status === 'pending' && (
          <Link
            href={`/student/apply/edit/${application.id}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Edit Application
          </Link>
        )}
      </div>
    </div>
  );
}
