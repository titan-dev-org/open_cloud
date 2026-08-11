import { notFound } from "next/navigation";
import { Download, File, Clock } from "lucide-react";

interface SharePageProps {
  params: {
    shareId: string;
  };
}

export default async function SharePage({ params }: SharePageProps) {
  const { shareId } = await params;

  try {
    // Fetch share data dari API
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/share/${shareId}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      notFound();
    }

    const { downloadUrl, fileKey } = await response.json();
    const fileName = fileKey.split("/").pop() || "file";

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <File className="w-10 h-10 text-blue-600" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">File Siap Diunduh</h1>
            <p className="text-gray-500 mb-6 break-all">{fileName}</p>

            <a
              href={downloadUrl}
              download={fileName}
              className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              <Download size={20} />
              Download File
            </a>

            <div className="mt-6 flex items-center justify-center gap-1 text-sm text-gray-400">
              <Clock size={14} />
              <span>Link akan kadaluarsa dalam 1 jam</span>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Share page error:", error);
    notFound();
  }
}
