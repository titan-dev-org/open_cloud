export const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

export const formatDate = (date: string): string => {
  const d = new Date(date)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60))
  
  if (diff < 1) return 'Baru saja'
  if (diff < 60) return `${diff} menit lalu`
  if (diff < 1440) return `${Math.floor(diff / 60)} jam lalu`
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 10)
}

export const getFileIcon = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('audio/')) return 'audio'
  if (mimeType === 'application/pdf') return 'pdf'
  if (mimeType.includes('zip') || mimeType.includes('rar')) return 'archive'
  if (mimeType.includes('javascript') || mimeType.includes('typescript')) return 'code'
  if (mimeType.startsWith('text/')) return 'text'
  return 'file'
    }
