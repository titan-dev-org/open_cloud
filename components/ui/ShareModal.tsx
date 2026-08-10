"use client";

import { useState } from "react";
import { X, Copy, Check, Calendar, Lock } from "lucide-react";
import { FileRecord } from "@/types";
import toast from "react-hot-toast";

interface ShareModalProps {
  file: FileRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onCreateShare: (fileId: string, password?: string, expiry?: string) => Promise<string>;
}

export function ShareModal({ file, isOpen, onClose, onCreateShare }: ShareModalProps) {
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [password, setPassword] = useState("");
  const [expiry, setExpiry] = useState("7d");

  if (!isOpen || !file) return null;

  const handleCreate = async () => {
    setLoading(true);
    try {
      const shareId = await onCreateShare(file.id, password || undefined, expiry);
      const url = `${process.env.NEXT_PUBLIC_APP_URL}/s/${shareId}`;
      setShareUrl(url);
      toast.success("Link share berhasil dibuat!");
    } catch (error) {
      toast.error("Gagal membuat link share");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link disalin!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Gagal menyalin link");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-gray-900 mb-2">Bagikan File</h2>
        <p className="text-gray-500 text-sm mb-6">
          {file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)
        </p>

        {shareUrl ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
              />
              <button
                onClick={copyToClipboard}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
              </button>
            </div>
            <button
              onClick={() => window.open(shareUrl, "_blank")}
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Buka Link
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Lock size={14} className="inline mr-1" />
                Password (Opsional)
              </label>
              <input
                type="text"
                placeholder="Kosongkan jika tidak perlu password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar size={14} className="inline mr-1" />
                Masa Berlaku
              </label>
              <select
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="1d">1 Hari</option>
                <option value="7d">7 Hari</option>
                <option value="30d">30 Hari</option>
                <option value="never">Selamanya</option>
              </select>
            </div>

            <button
              onClick={handleCreate}
              disabled={loading}
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Membuat..." : "Buat Link Share"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
    }
