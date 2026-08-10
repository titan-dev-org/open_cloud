"use client";

import { FileRecord } from "@/types";
import { FileIcon } from "./FileIcon";

interface FileGridProps {
  files: FileRecord[];
  onFileClick: (file: FileRecord) => void;
}

export function FileGrid({ files, onFileClick }: FileGridProps) {
  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  if (files.length === 0) {
    return (
      <div className="text-center py-12 col-span-full">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FolderOpen className="w-10 h-10 text-gray-400" />
        </div>
        <p className="text-gray-500 text-lg">Belum ada file</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {files.map((file) => (
        <div
          key={file.id}
          onClick={() => onFileClick(file)}
          className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div className="relative">
            <FileIcon mimeType={file.mimeType} className="w-12 h-12 mx-auto text-gray-500 group-hover:text-blue-500 transition-colors" />
            {file.shareId && (
              <div className="absolute -top-1 -right-1 bg-green-500 rounded-full w-3 h-3 border-2 border-white" title="Telah dibagikan" />
            )}
          </div>
          <p className="text-sm font-medium text-gray-800 truncate mt-3">
            {file.name}
          </p>
          <p className="text-xs text-gray-400">
            {formatSize(file.size)}
          </p>
        </div>
      ))}
    </div>
  );
}
