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
  const [rejectedFiles, setRejectedFiles] = useState<File[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[], rejected: any[]) => {
    if (rejected.length > 0) {
      setRejectedFiles(rejected.map(r => r.file));
      setTimeout(() => setRejectedFiles([]), 3000);
      return;
    }
    
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

  const clearFiles = () => {
    setUploadedFiles([]);
    setRejectedFiles([]);
  };

  return (
    <div className="space-y-3">
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
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent" />
            <p className="text-gray-600 font-medium">Uploading file...</p>
            <p className="text-gray-400 text-sm">{uploadedFiles.length} file diproses</p>
          </div>
        ) : uploadedFiles.length > 0 ? (
          <div className="space-y-2 text-left">
            {uploadedFiles.slice(0, 5).map((file, i) => (
              <div key={i} className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 min-w-0">
                  <File size={18} className="text-blue-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 truncate">{file.name}</span>
                  <span className="text-xs text-gray-400 flex-shrink-0">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
                </div>
                <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
              </div>
            ))}
            {uploadedFiles.length > 5 && (
              <p className="text-sm text-gray-400 text-center">
                +{uploadedFiles.length - 5} file lainnya
              </p>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearFiles();
              }}
              className="text-sm text-red-500 hover:text-red-600 font-medium"
            >
              Batal upload
            </button>
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

      {/* Rejected files warning */}
      {rejectedFiles.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-sm text-red-700">
          <AlertCircle size={18} />
          <span>
            {rejectedFiles.length} file ditolak (melebihi batas ukuran)
          </span>
          <button onClick={() => setRejectedFiles([])} className="ml-auto">
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
            }
