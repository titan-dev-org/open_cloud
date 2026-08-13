'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { FolderOpen, ArrowLeft, Plus, MoreVertical } from 'lucide-react'
import { FileList } from '@/components/ui/FileList'
import { FileGrid } from '@/components/ui/FileGrid'
import toast from 'react-hot-toast'

export default function FolderPage() {
  const params = useParams()
  const router = useRouter()
  const folderId = params.folderId as string
  const supabase = createClient()

  const [folder, setFolder] = useState<any>(null)
  const [files, setFiles] = useState<any[]>([])
  const [subFolders, setSubFolders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'list' | 'grid'>('list')

  useEffect(() => {
    const loadFolder = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get folder info
      const { data: folderData } = await supabase
        .from('folders')
        .select('*')
        .eq('id', folderId)
        .eq('user_id', user.id)
        .single()
      setFolder(folderData)

      // Get files in this folder
      const { data: filesData } = await supabase
        .from('files')
        .select('*')
        .eq('user_id', user.id)
        .eq('folder_id', folderId)
        .is('deleted_at', null)
      setFiles(filesData || [])

      // Get sub-folders
      const { data: foldersData } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', user.id)
        .eq('parent_id', folderId)
      setSubFolders(foldersData || [])

      setLoading(false)
    }

    loadFolder()
  }, [folderId])

  const createFolder = async () => {
    const name = prompt('Nama folder:')
    if (!name) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const id = Math.random().toString(36).substring(2, 10)
    const { error } = await supabase.from('folders').insert({
      id,
      name,
      user_id: user.id,
      parent_id: folderId,
    })

    if (error) {
      toast.error('Gagal membuat folder')
    } else {
      toast.success('Folder berhasil dibuat')
      setSubFolders([...subFolders, { id, name, parent_id: folderId }])
    }
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
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {folder?.name || 'Folder'}
          </h1>
          <p className="text-gray-500 text-sm">
            {files.length} file • {subFolders.length} folder
          </p>
        </div>
        <button
          onClick={createFolder}
          className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          Folder Baru
        </button>
      </div>

      {/* Sub Folders */}
      {subFolders.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
          {subFolders.map((f) => (
            <div
              key={f.id}
              onClick={() => router.push(`/folders/${f.id}`)}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <FolderOpen className="text-blue-500" size={32} />
              <p className="font-medium text-gray-900 mt-2 truncate">{f.name}</p>
            </div>
          ))}
        </div>
      )}

      {/* Files */}
      {view === 'list' ? (
        <FileList
          files={files}
          onDelete={(id) => {}}
          onShare={(file) => {}}
        />
      ) : (
        <FileGrid
          files={files}
          onFileClick={(file) => {}}
        />
      )}
    </div>
  )
    }
