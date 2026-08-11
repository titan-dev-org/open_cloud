import { notFound } from "next/navigation";
import { 
  Download, 
  File, 
  Clock, 
  Shield, 
  Eye,
  FileText,
  Image,
  Film,
  Music,
  Archive,
  FileCode,
  CheckCircle,
  Share2,
} from "lucide-react";
import { getShareData } from "@/lib/db";

interface SharePageProps {
  params: {
    shareId: string;
  };
}

export default async function SharePage({ params }: SharePageProps) {
  const { shareId } = await params;

  try {
    const shareData = await getShareData(shareId);

    if (!shareData || !shareData.file) {
      notFound();
    }

    const { file } = shareData;
    const fileName = file.name;
    const fileSize = file.size;
    const fileType = file.mime_type;

    // Generate URL download
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/share/${shareId}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      notFound();
    }

    const { downloadUrl } = await response.json();

    // Format ukuran file
    const formatSize = (bytes: number) => {
      if (bytes === 0) return "0 B";
      const k = 1024;
      const sizes = ["B", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
    };

    // Dapatkan ikon berdasarkan tipe file
    const getFileIcon = () => {
      if (fileType.startsWith("image/")) return <Image className="w-12 h-12 sm:w-16 sm:h-16 text-blue-500" />;
      if (fileType.startsWith("video/")) return <Film className="w-12 h-12 sm:w-16 sm:h-16 text-purple-500" />;
      if (fileType.startsWith("audio/")) return <Music className="w-12 h-12 sm:w-16 sm:h-16 text-green-500" />;
      if (fileType.includes("zip") || fileType.includes("rar")) return <Archive className="w-12 h-12 sm:w-16 sm:h-16 text-orange-500" />;
      if (fileType.includes("javascript") || fileType.includes("typescript") || fileType.includes("json")) 
        return <FileCode className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-500" />;
      if (fileType === "application/pdf") return <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-red-500" />;
      return <File className="w-12 h-12 sm:w-16 sm:h-16 text-gray-500" />;
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <div className="w-full max-w-md sm:max-w-lg md:max-w-xl">
          {/* Card Utama */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 border border-white/20">
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs sm:text-sm font-medium mb-3">
                <Shield size={14} />
                <span>Secure Share</span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                File Siap Diunduh
              </h1>
              <p className="text-sm sm:text-base text-gray-500 mt-1">
                Link ini aman dan terenkripsi
              </p>
            </div>

            {/* File Icon & Info */}
            <div className="flex flex-col items-center bg-gray-50/80 rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-gray-100/50 mb-6">
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-white rounded-2xl shadow-md flex items-center justify-center">
                  {getFileIcon()}
                </div>
                <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white">
                  <CheckCircle size={12} className="text-white sm:w-4 sm:h-4" />
                </div>
              </div>

              <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mt-4 text-center break-all max-w-full">
                {fileName}
              </h2>
              
              <div className="flex flex-wrap items-center justify-center gap-3 mt-3 text-xs sm:text-sm text-gray-500">
                <span className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full shadow-sm">
                  <File size={14} />
                  {formatSize(fileSize)}
                </span>
                <span className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full shadow-sm">
                  <FileText size={14} />
                  {fileType.split("/")[1] || fileType}
                </span>
                <span className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full shadow-sm">
                  <Clock size={14} />
                  {new Date(file.uploaded_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Download Button */}
            <a
              href={downloadUrl}
              download={fileName}
              className="w-full flex items-center justify-center gap-3 py-3.5 sm:py-4 bg-blue-600 text-white rounded-xl sm:rounded-2xl hover:bg-blue-700 transition-all hover:shadow-lg font-semibold text-sm sm:text-base"
            >
              <Download size={18} className="sm:w-5 sm:h-5" />
              Download File
            </a>

            {/* Footer Info */}
            <div className="mt-5 sm:mt-6 grid grid-cols-2 gap-3">
              <div className="text-center bg-blue-50/50 rounded-xl p-3">
                <p className="text-[10px] sm:text-xs text-blue-600 font-medium">🔒 Aman</p>
                <p className="text-[10px] sm:text-xs text-gray-400">Terenkripsi</p>
              </div>
              <div className="text-center bg-amber-50/50 rounded-xl p-3">
                <p className="text-[10px] sm:text-xs text-amber-600 font-medium">⏳ Kadaluarsa</p>
                <p className="text-[10px] sm:text-xs text-gray-400">1 jam</p>
              </div>
            </div>

            {/* Share Info */}
            <div className="mt-4 text-center">
              <p className="text-[10px] sm:text-xs text-gray-400 flex items-center justify-center gap-1">
                <Share2 size={12} />
                Link ini hanya bisa diunduh 1 kali per akses
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-4 sm:mt-6">
            <p className="text-[10px] sm:text-xs text-gray-400">
              Cloud Storage Pro • Secure File Sharing
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
