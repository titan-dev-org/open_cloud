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
  CheckSquare,
  Square,
  Link as LinkIcon,
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

  // Multi-select state
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);

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

  const handleCreateShare = async (fileIds: string[], password?: string, expiry?: string) => {
    const response = await fetch("/api/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileIds, password, expiry }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Gagal membuat share link");
    }

    const { shareId, shareUrl, fileCount } = await response.json();
    
    const refreshedFiles = await getFiles();
    setFiles(refreshedFiles);
    updateStats(refreshedFiles);
    
    // Clear selection
    setSelectedFiles(new Set());
    setIsMultiSelectMode(false);
    
    return shareId;
  };

  // Toggle file selection
  const toggleSelectFile = (fileId: string) => {
    const newSelection = new Set(selectedFiles);
    if (newSelection.has(fileId)) {
      newSelection.delete(fileId);
    } else {
      newSelection.add(fileId);
    }
    setSelectedFiles(newSelection);
  };

  // Select all files
  const selectAllFiles = () => {
    if (selectedFiles.size === filteredFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(filteredFiles.map(f => f.id)));
    }
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleShareSelected = () => {
    const selectedFileObjects = files.filter(f => selectedFiles.has(f.id));
    if (selectedFileObjects.length === 0) {
      toast.error("Pilih minimal 1 file");
      return;
    }
    // Buka share modal dengan multiple files
    // Kita kirim fileIds ke ShareModal
    // Untuk sementara kita pilih file pertama sebagai selected
    setSelectedFile(selectedFileObjects[0]);
    setIsShareModalOpen(true);
  };

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
        
        <main className="p-3 sm:p-4 md:p-6 max-w-full">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
            <StatsCard
              title="Total File"
              value={stats.totalFiles}
              icon={<FolderOpen size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />}
              color="blue"
            />
            <StatsCard
              title="Storage"
              value={`${(stats.totalSize / 1024 / 1024).toFixed(1)} MB`}
              icon={<HardDrive size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />}
              subtitle={`${stats.totalFiles} file`}
              color="green"
            />
            <StatsCard
              title="Dibagikan"
              value={stats.totalShares}
              icon={<Share2 size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />}
              color="purple"
            />
            <StatsCard
              title="Upload"
              value={uploading ? "⏳" : "+"}
              icon={<Upload size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />}
              subtitle={uploading ? "Uploading..." : "Tambah file"}
              color="orange"
            />
          </div>

          {/* Upload Area */}
          <div className="mb-3 sm:mb-4 md:mb-6">
            <FileUploader onUpload={handleUpload} />
          </div>

          {/* Toolbar dengan Multi-Select */}
          <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 xs:gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="flex items-center gap-2 w-full xs:w-auto">
              <div className="relative flex-1 xs:max-w-[200px] sm:max-w-xs">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                <input
                  type="text"
                  placeholder="Cari file..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              
              {/* Multi-select toggle */}
              <button
                onClick={() => {
                  setIsMultiSelectMode(!isMultiSelectMode);
                  if (isMultiSelectMode) setSelectedFiles(new Set());
                }}
                className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                  isMultiSelectMode ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:bg-gray-100"
                }`}
                title="Multi-select mode"
              >
                <CheckSquare size={16} className="sm:w-4 sm:h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 w-full xs:w-auto">
              {isMultiSelectMode && selectedFiles.size > 0 && (
                <button
                  onClick={handleShareSelected}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white text-xs sm:text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5"
                >
                  <LinkIcon size={14} />
                  Share {selectedFiles.size} file
                </button>
              )}
              
              {isMultiSelectMode && filteredFiles.length > 0 && (
                <button
                  onClick={selectAllFiles}
                  className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-xs sm:text-sm"
                >
                  {selectedFiles.size === filteredFiles.length ? "Deselect" : "Select All"}
                </button>
              )}

              <button
                onClick={loadFiles}
                className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw size={15} className="sm:w-4 sm:h-4" />
              </button>
              
              <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5 sm:p-1">
                <button
                  onClick={() => setView("list")}
                  className={`p-1.5 rounded-lg transition-colors ${
                    view === "list" ? "bg-white shadow-sm text-blue-600" : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <List size={14} className="sm:w-4 sm:h-4" />
                </button>
                <button
                  onClick={() => setView("grid")}
                  className={`p-1.5 rounded-lg transition-colors ${
                    view === "grid" ? "bg-white shadow-sm text-blue-600" : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <Grid3X3 size={14} className="sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* File List / Grid dengan Multi-Select */}
          <div className="w-full overflow-x-hidden">
            {view === "list" ? (
              <FileList
                files={filteredFiles}
                onDelete={handleDelete}
                onShare={(file) => {
                  setSelectedFile(file);
                  setIsShareModalOpen(true);
                }}
                isMultiSelect={isMultiSelectMode}
                selectedFiles={selectedFiles}
                onToggleSelect={toggleSelectFile}
              />
            ) : (
              <FileGrid
                files={filteredFiles}
                onFileClick={(file) => {
                  if (isMultiSelectMode) {
                    toggleSelectFile(file.id);
                  } else {
                    setSelectedFile(file);
                    setIsShareModalOpen(true);
                  }
                }}
                onDelete={handleDelete}
                onShare={(file) => {
                  setSelectedFile(file);
                  setIsShareModalOpen(true);
                }}
                isMultiSelect={isMultiSelectMode}
                selectedFiles={selectedFiles}
                onToggleSelect={toggleSelectFile}
              />
            )}
          </div>
        </main>
      </div>

      {/* Share Modal - modified untuk multi-file */}
      <ShareModal
        file={selectedFile}
        files={selectedFiles.size > 0 ? files.filter(f => selectedFiles.has(f.id)) : []}
        isOpen={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false);
          setSelectedFile(null);
        }}
        onCreateShare={handleCreateShare}
        isMultiFile={selectedFiles.size > 1}
      />
    </div>
  );
      }
