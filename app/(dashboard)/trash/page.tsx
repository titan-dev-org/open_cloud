'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Trash2, RotateCcw, HardDrive, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TrashPage() {
  const [files, setFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadTrash = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data } = await supabase
        .from('files')
        .select('*')
        .eq('user_id', user.id)
        .not('deleted_at', 'is', null)
      setFiles(data || [])
      setLoading(false)
    }

    loadTrash()
  }, [supabase, router])

  const restoreFile = async (id: string) => {
    const { error } = await supabase
      .from('files')
      .update({ deleted_at: null })
      .eq('id', id)

    if (error) {
      toast.error('Gagal restore file')
    } else {
      toast.success('File berhasil direstore')
      setFiles(files.filter(f => f.id !== id))
    }
  }

  const deletePermanent = async (id: string) => {
    if (!confirm('Hapus permanen file ini? Tindakan ini tidak bisa dibatalkan.')) return

    const { error } = await supabase
      .from('files')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error('Gagal menghapus file')
    } else {
      toast.success('File berhasil dihapus permanen')
      setFiles(files.filter(f => f.id !== id))
    }
  }

  const emptyTrash = async () => {
    if (!confirm('Hapus semua file di trash? Tindakan ini tidak bisa dibatalkan.')) return

    for (const file of files) {
      await supabase.from('files').delete().eq('id', file.id)
    }
    setFiles([])
    toast.success('Trash berhasil dikosongkan')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Trash2 className="text-red-500" size={28} />
            Trash
          </h1>
          <p className="text-gray-500 text-sm">{files.length} file di trash</p>
        </div>
        {files.length > 0 && (
          <button
            onClick={emptyTrash}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Kosongkan Trash
          </button>
        )}
      </div>

      {files.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Trash2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">Trash kosong</p>
          <p className="text-gray-400 text-sm">File yang dihapus akan muncul di sini</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {files.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <HardDrive size={20} className="text-gray-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{file.name}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span>{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(file.deleted_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => restoreFile(file.id)}
                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Restore"
                  >
                    <RotateCcw size={18} />
                  </button>
                  <button
                    onClick={() => deletePermanent(file.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Hapus Permanen"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
      }
