import { notFound } from "next/navigation";
import { ShareAccessResponse } from "@/types";

interface SharePageProps {
  params: {
    shareId: string;
  };
}

export default async function SharePage({ params }: SharePageProps) {
  const { shareId } = await params;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/share?id=${shareId}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    notFound();
  }

  const { downloadUrl, fileKey }: ShareAccessResponse = await response.json();
  const fileName = fileKey.split("/").pop() || "file";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        <h1 className="text-xl font-semibold text-gray-900 mb-2">📄 File Siap Diunduh</h1>
        <p className="text-gray-600 mb-6 break-all">{fileName}</p>

        <a
          href={downloadUrl}
          download={fileName}
          className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          ⬇️ Download File
        </a>

        <p className="mt-4 text-xs text-gray-400">Link ini akan kadaluarsa dalam 1 jam</p>
      </div>
    </div>
  );
}
