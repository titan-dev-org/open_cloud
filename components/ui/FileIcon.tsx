"use client";

import {
  File,
  FileImage,
  FileVideo,
  FileAudio,
  FileText,
  FilePdf,
  FileArchive,
  FileSpreadsheet,
  FileCode,
} from "lucide-react";

interface FileIconProps {
  mimeType: string;
  className?: string;
}

export function FileIcon({ mimeType, className = "w-10 h-10" }: FileIconProps) {
  const getIcon = () => {
    if (mimeType.startsWith("image/")) return FileImage;
    if (mimeType.startsWith("video/")) return FileVideo;
    if (mimeType.startsWith("audio/")) return FileAudio;
    if (mimeType === "application/pdf") return FilePdf;
    if (mimeType.includes("zip") || mimeType.includes("rar") || mimeType.includes("7z")) return FileArchive;
    if (mimeType.includes("spreadsheet") || mimeType.includes("excel") || mimeType.includes("csv")) return FileSpreadsheet;
    if (mimeType.includes("code") || mimeType.includes("javascript") || mimeType.includes("json")) return FileCode;
    if (mimeType.startsWith("text/")) return FileText;
    return File;
  };

  const Icon = getIcon();
  return <Icon className={className} />;
      }
