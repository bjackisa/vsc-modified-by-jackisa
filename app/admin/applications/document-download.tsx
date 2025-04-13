'use client';

interface DocumentDownloadProps {
  documentId: string;
  blobUrl: string | null;
  name: string;
  mimeType: string;
}

export default function DocumentDownload({ documentId, blobUrl, name, mimeType }: DocumentDownloadProps) {
  return (
    <li className="py-3 flex justify-between items-center">
      <div>
        <p className="font-medium">{name}</p>
        <p className="text-sm text-gray-500">{mimeType}</p>
      </div>
      <a
        href={blobUrl || `/api/documents?id=${documentId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
      >
        Download
      </a>
    </li>
  );
}
