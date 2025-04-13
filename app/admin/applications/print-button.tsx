'use client';

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
    >
      Print Application
    </button>
  );
}
