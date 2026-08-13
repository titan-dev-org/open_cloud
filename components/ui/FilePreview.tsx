"use client"

import { useState } from "react"
import { X, Download, Maximize2, Minimize2, File } from "lucide-react"

interface FilePreviewProps {
  file: {
    name: string
    mime_type: string
    public_url: string
  } | null
  isOpen: boolean
  onClose: () => void
}

export function FilePreview({ file, isOpen, onClose }: FilePreviewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  if (!isOpen || !file) return null

  const isImage = file.mime_type.startsWith("image/")
  const isVideo = file.mime_type.startsWith("video/")
  const isPDF = file.mime_type === "application/pdf"

  const getPreviewContent = () => {
    if (isImage) {
      return (
        <img
          src={file.public_url}
          alt={file.name}
          className={`w-full h-auto max-h-[70vh] object-contain ${isFullscreen ? "max-h-[90vh]" : ""}`}
        />
      )
    }

    if (isVideo) {
      return (
        <video
          src={file.public_url}
          controls
          className={`w-full max-h-[70vh] ${isFullscreen ? "max-h-[90vh]" : ""}`}
          autoPlay={false}
        />
      )
    }

    if (isPDF) {
      return (
        <embed
          src={file.public_url}
          type="application/pdf"
          className={`w-full h-[60vh] ${isFullscreen ? "h-[85vh]" : ""}`}
        />
      )
    }

    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <File className="w-10 h-10 text-gray-400" />
        </div>
        <p className="text-gray-600 text-center">
          Preview tidak tersedia untuk file ini
        </p>
        <p className="text-sm text-gray-400 mt-1">
          {file.mime_type} • {file.name}
        </p>
      </div>
    )
  }

  return (
    <div
      className={`fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 ${
        isFullscreen ? "p-0" : ""
      }`}
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-4xl transition-all ${
          isFullscreen ? "rounded-none max-w-full h-full" : ""
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-medium text-gray-900 truncate">{file.name}</span>
            <span className="text-xs text-gray-400 flex-shrink-0">{file.mime_type}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            <a
              href={file.public_url}
              download={file.name}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Download size={18} />
            </a>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className={`p-4 ${isFullscreen ? "p-0 h-[calc(100%-64px)]" : ""}`}>
          <div className={`flex items-center justify-center ${isFullscreen ? "h-full" : ""}`}>
            {getPreviewContent()}
          </div>
        </div>
      </div>
    </div>
  )
          }
