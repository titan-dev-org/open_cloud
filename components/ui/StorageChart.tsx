'use client'

import { useMemo } from 'react'

interface StorageChartProps {
  used: number
  limit: number
}

export function StorageChart({ used, limit }: StorageChartProps) {
  const percent = Math.min((used / limit) * 100, 100)
  const isNearFull = percent > 80
  const isFull = percent >= 100

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
  }

  const getColor = () => {
    if (isFull) return 'bg-red-500'
    if (isNearFull) return 'bg-orange-500'
    return 'bg-blue-500'
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">
          {formatBytes(used)} digunakan
        </span>
        <span className="text-gray-400">
          dari {formatBytes(limit)} ({percent.toFixed(1)}%)
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${getColor()}`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>

      {isNearFull && !isFull && (
        <p className="text-xs text-orange-500 mt-1">
          ⚠️ Storage hampir penuh!
        </p>
      )}
      {isFull && (
        <p className="text-xs text-red-500 mt-1">
          ⛔ Storage penuh! Hapus beberapa file untuk melanjutkan.
        </p>
      )}
    </div>
  )
      }
