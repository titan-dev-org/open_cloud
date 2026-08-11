"use client";

import { useState } from "react";
import {
  Trash2,
  Link as LinkIcon,
  Download,
  Clock,
  Copy,
  Check,
  FolderOpen,
} from "lucide-react";
import { FileRecord } from "@/lib/supabase";
import { FileIcon } from "./FileIcon";
import toast from "react-hot-toast";

interface FileListProps {
  files: FileRecord[];
  onDelete: (id: string) => void;
  onShare: (file: FileRecord) => void;
}

export function FileList({ files, onDelete, onShare }: FileListProps) {
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
      year: "numeric",
    });
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success("Link disalin!");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Gagal menyalin link");
    }
  };

  if (files.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FolderOpen className="w-10 h-10 text-gray-400" />
        </div>
        <p className="text-gray-500 text-lg font-medium">Belum ada file</p>
        <p className="text-gray-400 text-sm mt-1">Upload file pertama Anda</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nama File
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ukuran
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipe
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Diupload
              </th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {files.map((file) => (
              <tr key={file.id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <FileIcon mimeType={file.mime_type} className="w-8 h-8 text-gray-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate max-w-[120px] sm:max-w-[200px]">
                        {file.name}
                      </p>
                      {file.share_id && (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                          <LinkIcon size={10} />
                          Dibagikan
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                  {formatSize(file.size)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                    {file.mime_type.split("/")[1] || file.mime_type}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    {formatDate(file.uploaded_at)}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-0.5 sm:gap-1">
                    {file.share_id && (
                      <button
                        onClick={() => copyToClipboard(`${process.env.NEXT_PUBLIC_APP_URL}/s/${file.share_id}`, file.id)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Salin link share"
                      >
                        {copiedId === file.id ? (
                          <Check size={18} className="text-green-600" />
                        ) : (
                          <Copy size={18} />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => onShare(file)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Buat link share"
                    >
                      <LinkIcon size={18} />
                    </button>
                    <a
                      href={file.public_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Download file"
                    >
                      <Download size={18} />
                    </a>
                    <button
                      onClick={() => onDelete(file.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus file"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-500 flex items-center justify-between">
        <span>Total {files.length} file</span>
        <span className="text-xs text-gray-400">
          {files.reduce((acc, f) => acc + f.size, 0) > 0 
            ? `${(files.reduce((acc, f) => acc + f.size, 0) / 1024 / 1024).toFixed(1)} MB total`
            : "0 MB total"}
        </span>
      </div>
    </div>
  );
          }
