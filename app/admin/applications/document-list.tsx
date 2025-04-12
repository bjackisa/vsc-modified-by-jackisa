'use client';

import { documents } from '@/lib/schema';

interface DocumentListProps {
  documents: typeof documents.$inferSelect[] | null;
}

export default function DocumentList({ documents }: DocumentListProps) {
  if (!documents || documents.length === 0) {
    return <p className="text-gray-500 text-sm">No documents uploaded</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {documents.map((doc) => (
        <div key={doc.id} className="flex items-center justify-between p-2 border rounded">
          <span className="truncate mr-2">{doc.name}</span>
          <a
            href={doc.blob_url || `/api/documents?id=${doc.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            Download
          </a>
        </div>
      ))}
    </div>
  );
}
