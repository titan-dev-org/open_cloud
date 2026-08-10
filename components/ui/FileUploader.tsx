"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, File, CheckCircle, AlertCircle } from "lucide-react";

interface FileUploaderProps {
  onUpload: (files: File[]) => Promise<void>;
  maxSize?: number;
}

export function FileUploader({ onUpload, maxSize = 100 * 1024 * 1024 }: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploadedFiles(acceptedFiles);
    setUploading(true);
    try {
      await onUpload(acceptedFiles);
      setUploadedFiles([]);
    } finally {
      setUploading(false);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize,
    multiple: true,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
        ${isDragActive
          ? "border-blue-500 bg-blue-50"
          : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
        }
        ${uploading ? "opacity-50 pointer-events-none" : ""}
      `}
    >
      <input {...getInputProps()} />
      
      {uploading ? (
        <div className="flex flex-col items-center gap-2 py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <p className="text-gray-600">Uploading...</p>
        </div>
      ) : uploadedFiles.length > 0 ? (
        <div className="space-y-2">
          {uploadedFiles.map((file, i) => (
            <div key={i} className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2">
                <File size={18} className="text-blue-500" />
                <span className="text-sm text-gray-700">{file.name}</span>
                <span className="text-xs text-gray-400">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
              </div>
              <CheckCircle size={18} className="text-green-500" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-gray-600 font-medium">
            {isDragActive ? "Lepaskan file di sini" : "Drag & drop file di sini"}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            atau klik untuk memilih file
          </p>
          <p className="text-gray-400 text-xs mt-2">
            Maksimal {maxSize / 1024 / 1024}MB per file
          </p>
        </>
      )}
    </div>
  );
    }
