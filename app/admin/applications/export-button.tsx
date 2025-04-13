'use client';

interface ExportButtonProps {
  applicationId: string;
}

export default function ExportButton({ applicationId }: ExportButtonProps) {
  return (
    <a
      href={`/api/applications/export?id=${applicationId}`}
      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
    >
      Export as JSON
    </a>
  );
}
