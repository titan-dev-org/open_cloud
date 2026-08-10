"use client";

import { useState, useRef } from "react";
import { UploadResponse, ShareResponse } from "@/types";

export default function DashboardPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [fileKey, setFileKey] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadedUrl(null);
      setShareUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadedUrl(null);
    setShareUrl(null);

    try {
      // Step 1: Minta Presigned URL
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          filetype: file.type,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get upload URL");
      }

      const data: UploadResponse = await response.json();

      // Step 2: Upload file langsung ke Filebase
      const uploadResponse = await fetch(data.presignedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Upload failed");
      }

      setUploadedUrl(data.publicUrl);
      setFileKey(data.fileKey);
      alert("✅ File berhasil diupload!");
    } catch (error) {
      console.error("Upload error:", error);
      alert("❌ Upload gagal: " + (error as Error).message);
    } finally {
      setUploading(false);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleCreateShareLink = async () => {
    if (!fileKey) return;

    try {
      const response = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileKey }),
      });

      if (!response.ok) {
        throw new Error("Failed to create share link");
      }

      const data: ShareResponse = await response.json();
      setShareUrl(data.shareUrl);
    } catch (error) {
      alert("❌ Gagal buat link: " + (error as Error).message);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("📋 Link disalin!");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">📁 Upload File</h1>

          {/* Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Pilih File
            </label>

            {file && (
              <div className="mt-4">
                <p className="text-sm text-gray-700">
                  📄 {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
                >
                  {uploading ? "⏳ Uploading..." : "⬆️ Upload"}
                </button>
              </div>
            )}
          </div>

          {/* Hasil Upload */}
          {uploadedUrl && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 font-medium">✅ Upload sukses!</p>
              <p className="text-sm break-all mt-2 text-gray-600">
                URL:{" "}
                <a
                  href={uploadedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {uploadedUrl}
                </a>
              </p>

              <button
                onClick={handleCreateShareLink}
                className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                🔗 Buat Share Link
              </button>

              {shareUrl && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-700 font-medium">🔗 Link Share:</p>
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={shareUrl}
                      readOnly
                      className="flex-1 p-2 border rounded bg-white text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(shareUrl)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
                    }
