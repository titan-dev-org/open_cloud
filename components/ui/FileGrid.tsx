"use client";

import { useState } from "react";
import { 
  FolderOpen, 
  Link as LinkIcon, 
  Download, 
  Clock, 
  Copy, 
  Check,
  MoreVertical,
} from "lucide-react";
import { FileRecord } from "@/lib/supabase";
import { FileIcon } from "./FileIcon";
import toast from "react-hot-toast";

interface FileGridProps {
  files: FileRecord[];
  onFileClick: (file: FileRecord) => void;
  onDelete?: (id: string) => void;
  onShare?: (file: FileRecord) => void;
}

export function FileGrid({ files, onFileClick, onDelete, onShare }: FileGridProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60));
    
    if (diff < 1) return "Baru saja";
    if (diff < 60) return `${diff} menit lalu`;
    if (diff < 1440) return `${Math.floor(diff / 60)} jam lalu`;
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });
  };

  const copyToClipboard = async (text: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success("Link disalin!");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Gagal menyalin link");
    }
  };

  const handleShare = (file: FileRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShare) {
      onShare(file);
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      if (confirm("Apakah Anda yakin ingin menghapus file ini?")) {
        onDelete(id);
      }
    }
  };

  if (files.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-gray-200 col-span-full">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FolderOpen className="w-10 h-10 text-gray-400" />
        </div>
        <p className="text-gray-500 text-lg font-medium">Belum ada file</p>
        <p className="text-gray-400 text-sm mt-1">Upload file pertama Anda</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {files.map((file) => (
        <div
          key={file.id}
          onClick={() => onFileClick(file)}
          className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:shadow-lg hover:border-blue-300 hover:-translate-y-0.5 transition-all cursor-pointer group relative"
        >
          {/* Badge status */}
          <div className="relative">
            <FileIcon mimeType={file.mime_type} className="w-14 h-14 mx-auto text-gray-500 group-hover:text-blue-500 transition-colors" />
            
            {file.share_id && (
              <div className="absolute -top-1 -right-1 bg-green-500 rounded-full w-3 h-3 border-2 border-white" title="Telah dibagikan" />
            )}
          </div>
          
          <p className="text-sm font-medium text-gray-800 truncate mt-3">
            {file.name}
          </p>
          
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="text-xs text-gray-400">
              {formatSize(file.size)}
            </span>
            <span className="text-xs text-gray-300">•</span>
            <span className="text-xs text-gray-400 flex items-center gap-0.5">
              <Clock size={10} />
              {formatDate(file.uploaded_at)}
            </span>
          </div>
          
          {/* Aksi - muncul saat hover */}
          <div className="flex items-center justify-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
            {file.share_id && (
              <button
                onClick={(e) => copyToClipboard(`${process.env.NEXT_PUBLIC_APP_URL}/s/${file.share_id}`, file.id, e)}
                className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Salin link"
              >
                {copiedId === file.id ? (
                  <Check size={14} className="text-green-600" />
                ) : (
                  <Copy size={14} />
                )}
              </button>
            )}
            {onShare && (
              <button
                onClick={(e) => handleShare(file, e)}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Buat link share"
              >
                <LinkIcon size={14} />
              </button>
            )}
            <a
              href={file.public_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              title="Download"
            >
              <Download size={14} />
            </a>
            {onDelete && (
              <button
                onClick={(e) => handleDelete(file.id, e)}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Hapus"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
  }
