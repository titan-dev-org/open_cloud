"use client";

import { useState, useEffect } from "react";
import { X, Copy, Check, Calendar, Lock, Link as LinkIcon, Eye, EyeOff } from "lucide-react";
import { FileRecord } from "@/lib/supabase"; // ← PERBAIKAN INI
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
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [expiry, setExpiry] = useState("7d");
  const [isCreating, setIsCreating] = useState(false);

  // Reset state saat modal ditutup
  useEffect(() => {
    if (!isOpen) {
      setShareUrl(null);
      setCopied(false);
      setPassword("");
      setExpiry("7d");
      setIsCreating(false);
    }
  }, [isOpen]);

  if (!isOpen || !file) return null;

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCreate = async () => {
    if (isCreating) return;
    
    setIsCreating(true);
    setLoading(true);
    
    try {
      const shareId = await onCreateShare(
        file.id, 
        password || undefined, 
        expiry
      );
      
      const url = `${process.env.NEXT_PUBLIC_APP_URL}/s/${shareId}`;
      setShareUrl(url);
      
      toast.success("✨ Link share berhasil dibuat!");
    } catch (error) {
      console.error("Create share error:", error);
      toast.error("Gagal membuat link share: " + (error as Error).message);
    } finally {
      setLoading(false);
      setIsCreating(false);
    }
  };

  const copyToClipboard = async () => {
    if (!shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("📋 Link disalin ke clipboard!");
      
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error("Gagal menyalin link");
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          disabled={loading}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
            <LinkIcon size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Bagikan File</h2>
            <p className="text-sm text-gray-500">Buat link untuk berbagi file</p>
          </div>
        </div>
        
        {/* File Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-100">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {file.name}
              </p>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                <span>{formatSize(file.size)}</span>
                <span>•</span>
                <span>{file.mime_type}</span>
                <span>•</span>
                <span>Upload: {formatDate(file.uploaded_at)}</span>
              </div>
            </div>
            {file.share_id && (
              <span className="flex-shrink-0 inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <Check size={12} />
                Dibagikan
              </span>
            )}
          </div>
        </div>

        {/* Hasil Share URL */}
        {shareUrl ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 bg-transparent text-sm text-gray-700 outline-none truncate"
              />
              <button
                onClick={copyToClipboard}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
              >
                {copied ? (
                  <Check size={18} className="text-green-500" />
                ) : (
                  <Copy size={18} className="text-gray-500" />
                )}
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => window.open(shareUrl, "_blank")}
                className="py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Buka Link
              </button>
              <button
                onClick={() => {
                  setShareUrl(null);
                  setCopied(false);
                  toast.info("Buat link share baru");
                }}
                className="py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Buat Ulang
              </button>
            </div>

            {file.share_id && (
              <div className="text-center text-xs text-gray-400 bg-gray-50 rounded-lg p-2">
                🔗 File ini sudah memiliki link share sebelumnya
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <Lock size={14} className="inline mr-1.5" />
                Password (Opsional)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Kosongkan jika tidak perlu password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:opacity-50 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                Biarkan kosong untuk akses publik tanpa password
              </p>
            </div>

            {/* Expiry Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <Calendar size={14} className="inline mr-1.5" />
                Masa Berlaku
              </label>
              <select
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:opacity-50 appearance-none bg-white"
              >
                <option value="1h">1 Jam</option>
                <option value="6h">6 Jam</option>
                <option value="12h">12 Jam</option>
                <option value="1d">1 Hari</option>
                <option value="3d">3 Hari</option>
                <option value="7d">7 Hari</option>
                <option value="30d">30 Hari</option>
                <option value="never">Selamanya</option>
              </select>
            </div>

            {/* Create Button */}
            <button
              onClick={handleCreate}
              disabled={loading || isCreating}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Membuat...
                </>
              ) : (
                <>
                  <LinkIcon size={18} />
                  Buat Link Share
                </>
              )}
            </button>

            {/* Info */}
            <div className="text-center text-xs text-gray-400">
              Link akan kadaluarsa sesuai masa berlaku yang dipilih
            </div>
          </div>
        )}
      </div>
    </div>
  );
            }
