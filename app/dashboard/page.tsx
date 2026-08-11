"use client";

import { useState, useEffect } from "react";
import {
  Upload,
  FolderOpen,
  Share2,
  HardDrive,
  Search,
  List,
  Grid3X3,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

import { FileUploader } from "@/components/ui/FileUploader";
import { FileList } from "@/components/ui/FileList";
import { FileGrid } from "@/components/ui/FileGrid";
import { StatsCard } from "@/components/ui/StatsCard";
import { ShareModal } from "@/components/ui/ShareModal";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { FileRecord } from "@/lib/supabase";
import { getFiles, saveFile, deleteFile } from "@/lib/db";

interface Stats {
  totalFiles: number;
  totalSize: number;
  totalShares: number;
}

export default function DashboardPage() {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [view, setView] = useState<"list" | "grid">("list");
  const [search, setSearch] = useState("");
  const [selectedFile, setSelectedFile] = useState<FileRecord | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [stats, setStats] = useState<Stats>({
    totalFiles: 0,
    totalSize: 0,
    totalShares: 0,
  });

  const loadFiles = async () => {
    setLoading(true);
    try {
      const storedFiles = await getFiles();
      setFiles(storedFiles);
      updateStats(storedFiles);
    } catch (error) {
      console.error("Failed to load files:", error);
      toast.error("Gagal memuat file");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const updateStats = (fileList: FileRecord[]) => {
    const totalSize = fileList.reduce((acc, f) => acc + f.size, 0);
    const totalShares = fileList.filter(f => f.share_id).length;
    setStats({
      totalFiles: fileList.length,
      totalSize,
      totalShares,
    });
  };

  const handleUpload = async (uploadedFiles: File[]) => {
    setUploading(true);
    try {
      const uploaded: FileRecord[] = [];
      
      for (const file of uploadedFiles) {
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            filetype: file.type,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Gagal mendapatkan URL upload");
        }

        const data = await response.json();

        const uploadResponse = await fetch(data.presignedUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });

        if (!uploadResponse.ok) {
          throw new Error("Gagal upload file ke storage");
        }

        const fileRecord: FileRecord = {
          id: data.fileKey,
          name: file.name,
          key: data.fileKey,
          size: file.size,
          mime_type: file.type || "application/octet-stream",
          uploaded_at: new Date().toISOString(),
          public_url: data.publicUrl,
        };

        uploaded.push(fileRecord);
        await saveFile(fileRecord);
      }

      await loadFiles();
      toast.success(`${uploaded.length} file berhasil diupload!`);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Gagal upload file: " + (error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus file ini?")) return;
    
    try {
      await deleteFile(id);
      await loadFiles();
      toast.success("File berhasil dihapus");
    } catch (error) {
      toast.error("Gagal menghapus file");
    }
  };

  const handleCreateShare = async (fileId: string, password?: string, expiry?: string) => {
    const response = await fetch("/api/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileId, password, expiry }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Gagal membuat share link");
    }

    const { shareId } = await response.json();
    
    // Refresh files secara manual agar share_id langsung muncul
    const refreshedFiles = await getFiles();
    setFiles(refreshedFiles);
    updateStats(refreshedFiles);
    
    return shareId;
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 lg:ml-64 min-w-0">
        <Header title="Dashboard" />
        
        <main className="p-4 sm:p-6 max-w-full">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <StatsCard
              title="Total File"
              value={stats.totalFiles}
              icon={<FolderOpen size={18} className="sm:w-5 sm:h-5" />}
              color="blue"
            />
            <StatsCard
              title="Total Storage"
              value={`${(stats.totalSize / 1024 / 1024).toFixed(1)} MB`}
              icon={<HardDrive size={18} className="sm:w-5 sm:h-5" />}
              subtitle={`${stats.totalFiles} file`}
              color="green"
            />
            <StatsCard
              title="File Dibagikan"
              value={stats.totalShares}
              icon={<Share2 size={18} className="sm:w-5 sm:h-5" />}
              color="purple"
            />
            <StatsCard
              title="Upload"
              value={uploading ? "⏳" : "+ Tambah"}
              icon={<Upload size={18} className="sm:w-5 sm:h-5" />}
              subtitle={uploading ? "Sedang upload..." : "Klik untuk upload"}
              color="orange"
            />
          </div>

          <div className="mb-4 sm:mb-6">
            <FileUploader onUpload={handleUpload} />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="w-full sm:max-w-xs">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Cari file..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={loadFiles}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw size={18} />
              </button>
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setView("list")}
                  className={`p-1.5 rounded-lg transition-colors ${
                    view === "list" ? "bg-white shadow-sm text-blue-600" : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <List size={16} />
                </button>
                <button
                  onClick={() => setView("grid")}
                  className={`p-1.5 rounded-lg transition-colors ${
                    view === "grid" ? "bg-white shadow-sm text-blue-600" : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <Grid3X3 size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="w-full overflow-x-hidden">
            {view === "list" ? (
              <FileList
                files={filteredFiles}
                onDelete={handleDelete}
                onShare={(file) => {
                  setSelectedFile(file);
                  setIsShareModalOpen(true);
                }}
              />
            ) : (
              <FileGrid
                files={filteredFiles}
                onFileClick={(file) => {
                  setSelectedFile(file);
                  setIsShareModalOpen(true);
                }}
                onDelete={handleDelete}
                onShare={(file) => {
                  setSelectedFile(file);
                  setIsShareModalOpen(true);
                }}
              />
            )}
          </div>
        </main>
      </div>

      <ShareModal
        file={selectedFile}
        isOpen={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false);
          setSelectedFile(null);
        }}
        onCreateShare={handleCreateShare}
      />
    </div>
  );
    }
