import { notFound } from "next/navigation";
import { 
  Download, 
  File, 
  Clock, 
  Shield, 
  FileText,
  Image,
  Film,
  Music,
  Archive,
  FileCode,
  CheckCircle,
  Share2,
  FolderOpen,
} from "lucide-react";

interface SharePageProps {
  params: {
    shareId: string;
  };
}

interface FileWithUrl {
  id: string;
  name: string;
  key: string;
  size: number;
  mime_type: string;
  uploaded_at: string;
  public_url: string;
  downloadUrl: string;
}

export default async function SharePage({ params }: SharePageProps) {
  const { shareId } = await params;

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/share/${shareId}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      notFound();
    }

    const data = await response.json();
    const files: FileWithUrl[] = data.files || [];
    const totalFiles = data.totalFiles || 0;

    if (files.length === 0) {
      notFound();
    }

    const formatSize = (bytes: number) => {
      if (bytes === 0) return "0 B";
      const k = 1024;
      const sizes = ["B", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
    };

    const getFileIcon = (mimeType: string) => {
      if (mimeType.startsWith("image/")) return <Image className="w-5 h-5 text-blue-500 flex-shrink-0" />;
      if (mimeType.startsWith("video/")) return <Film className="w-5 h-5 text-purple-500 flex-shrink-0" />;
      if (mimeType.startsWith("audio/")) return <Music className="w-5 h-5 text-green-500 flex-shrink-0" />;
      if (mimeType.includes("zip") || mimeType.includes("rar")) return <Archive className="w-5 h-5 text-orange-500 flex-shrink-0" />;
      if (mimeType.includes("javascript") || mimeType.includes("typescript") || mimeType.includes("json")) 
        return <FileCode className="w-5 h-5 text-yellow-500 flex-shrink-0" />;
      if (mimeType === "application/pdf") return <FileText className="w-5 h-5 text-red-500 flex-shrink-0" />;
      return <File className="w-5 h-5 text-gray-500 flex-shrink-0" />;
    };

    const totalSize = files.reduce((acc, f) => acc + f.size, 0);

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 sm:p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 border border-white/20 mb-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs sm:text-sm font-medium mb-2">
                  <Shield size={14} />
                  <span>Secure Share</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {totalFiles} File Dibagikan
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Total {formatSize(totalSize)} • {totalFiles} file
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Clock size={14} />
                  <span>Berlaku 1 jam</span>
                </div>
              </div>
            </div>
          </div>

          {/* File List */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100/50 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {files.map((file) => (
                <div 
                  key={file.id} 
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 sm:p-5 hover:bg-gray-50/80 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1 w-full sm:w-auto">
                    {getFileIcon(file.mime_type)}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm sm:text-base font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                        <span>{formatSize(file.size)}</span>
                        <span>•</span>
                        <span>{file.mime_type.split("/")[1] || file.mime_type}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <Clock size={10} />
                          {new Date(file.uploaded_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <a
                    href={file.downloadUrl}
                    download={file.name}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex-shrink-0"
                  >
                    <Download size={16} />
                    Download
                  </a>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="bg-gray-50/80 px-4 sm:px-5 py-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <FolderOpen size={14} />
                {totalFiles} file • {formatSize(totalSize)}
              </span>
              <span className="flex items-center gap-1">
                <Share2 size={14} />
                Dibagikan melalui Cloud Storage Pro
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-xs text-gray-400">
              Cloud Storage Pro • Secure File Sharing • Link ini hanya bisa diunduh 1 kali per akses
            </p>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Share page error:", error);
    notFound();
  }
                  }
