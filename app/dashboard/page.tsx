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
} from "lucide-react";
import toast from "react-hot-toast";

import { FileUploader } from "@/components/ui/FileUploader";
import { FileList } from "@/components/ui/FileList";
import { FileGrid } from "@/components/ui/FileGrid";
import { StatsCard } from "@/components/ui/StatsCard";
import { ShareModal } from "@/components/ui/ShareModal";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { FileRecord, Stats } from "@/types";
import { getFiles, saveFile, deleteFile, updateFile } from "@/lib/db";

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

  // Load files from Supabase
  useEffect(() => {
    const loadFiles = async () => {
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
        // 1. Minta Presigned URL
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            filetype: file.type,
          }),
        });

        if (!response.ok) {
          throw new Error("Gagal mendapatkan URL upload");
        }

        const data = await response.json();

        // 2. Upload ke Filebase
        const uploadResponse = await fetch(data.presignedUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });

        if (!uploadResponse.ok) {
          throw new Error("Gagal upload file");
        }

        // 3. Simpan ke Supabase
        const fileRecord: FileRecord = {
          id: data.fileKey,
          name: file.name,
          key: data.fileKey,
          size: file.size,
          mime_type: file.type,
          uploaded_at: new Date().toISOString(),
          public_url: data.publicUrl,
        };

        uploaded.push(fileRecord);
        await saveFile(fileRecord);
      }

      // Refresh files
      const updatedFiles = await getFiles();
      setFiles(updatedFiles);
      updateStats(updatedFiles);

      toast.success(`${uploaded.length} file berhasil diupload!`);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Gagal upload file: " + (error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus file ini?")) {
      try {
        await deleteFile(id);
        const updatedFiles = await getFiles();
        setFiles(updatedFiles);
        updateStats(updatedFiles);
        toast.success("File berhasil dihapus");
      } catch (error) {
        toast.error("Gagal menghapus file");
      }
    }
  };

  const handleCreateShare = async (fileId: string, password?: string, expiry?: string) => {
    // Panggil API untuk create share
    const response = await fetch("/api/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileId, password, expiry }),
    });

    if (!response.ok) {
      throw new Error("Gagal membuat share link");
    }

    const { shareId, shareUrl } = await response.json();
    
    // Refresh files
    const updatedFiles = await getFiles();
    setFiles(updatedFiles);
    updateStats(updatedFiles);
    
    return shareId;
  };

  // ... rest of the component (sama seperti sebelumnya)
                          }
