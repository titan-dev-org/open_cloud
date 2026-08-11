"use client";

import {
  File,
  FileImage,
  FileVideo,
  FileAudio,
  FileText,
  FileArchive,
  FileSpreadsheet,
  FileCode,
  FileJson,
  FileType,
  FileDigit,
} from "lucide-react";

interface FileIconProps {
  mimeType: string;
  className?: string;
}

export function FileIcon({ mimeType, className = "w-10 h-10" }: FileIconProps) {
  const getIcon = () => {
    // Gambar
    if (mimeType.startsWith("image/")) return FileImage;
    
    // Video
    if (mimeType.startsWith("video/")) return FileVideo;
    
    // Audio
    if (mimeType.startsWith("audio/")) return FileAudio;
    
    // PDF - gunakan FileText atau FileType sebagai ganti
    if (mimeType === "application/pdf") return FileType;
    
    // Archive/ZIP
    if (mimeType.includes("zip") || 
        mimeType.includes("rar") || 
        mimeType.includes("7z") ||
        mimeType.includes("tar") ||
        mimeType.includes("gz")) return FileArchive;
    
    // Spreadsheet
    if (mimeType.includes("spreadsheet") || 
        mimeType.includes("excel") || 
        mimeType.includes("csv") ||
        mimeType === "application/vnd.ms-excel" ||
        mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") return FileSpreadsheet;
    
    // Code/JSON
    if (mimeType.includes("json")) return FileJson;
    if (mimeType.includes("javascript") || 
        mimeType.includes("typescript") ||
        mimeType.includes("html") ||
        mimeType.includes("css") ||
        mimeType.includes("xml")) return FileCode;
    
    // Text
    if (mimeType.startsWith("text/")) return FileText;
    
    // Word/Document
    if (mimeType.includes("word") || 
        mimeType === "application/msword" ||
        mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return FileType;
    
    // Fallback
    return File;
  };

  const Icon = getIcon();
  return <Icon className={className} />;
        }
