'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { FolderOpen, HardDrive, Share2, Trash2, Star, Plus, File } from 'lucide-react'
import { StorageChart } from '@/components/ui/StorageChart'
import { StatsCard } from '@/components/ui/StatsCard'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [files, setFiles] = useState<any[]>([])
  const [folders, setFolders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      // Get profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(profile)

      // Get files (not in trash)
      const { data: files } = await supabase
        .from('files')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
      setFiles(files || [])

      // Get folders
      const { data: folders } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', user.id)
        .is('parent_id', null)
      setFolders(folders || [])

      setLoading(false)
    }

    loadData()
  }, [supabase, router])

  const totalSize = files.reduce((acc, f) => acc + f.size, 0)
  const storageLimit = profile?.storage_limit || 1073741824 // 1GB
  const usagePercent = (totalSize / storageLimit) * 100

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
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Selamat datang, {user?.email}</p>
        </div>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          Upload File
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total File"
          value={files.length}
          icon={<File size={18} />}
          color="blue"
        />
        <StatsCard
          title="Total Folder"
          value={folders.length}
          icon={<FolderOpen size={18} />}
          color="green"
        />
        <StatsCard
          title="Storage Used"
          value={`${(totalSize / 1024 / 1024).toFixed(1)} MB`}
          icon={<HardDrive size={18} />}
          subtitle={`${(usagePercent).toFixed(1)}% of 1GB`}
          color="orange"
        />
        <StatsCard
          title="Shared Files"
          value={files.filter(f => f.share_id).length}
          icon={<Share2 size={18} />}
          color="purple"
        />
      </div>

      {/* Storage Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Penggunaan Storage</h2>
        <StorageChart used={totalSize} limit={storageLimit} />
      </div>

      {/* Quick Access */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          onClick={() => router.push('/dashboard')}
          className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
        >
          <FolderOpen className="text-blue-600 mb-3" size={24} />
          <h3 className="font-semibold text-gray-900">My Files</h3>
          <p className="text-sm text-gray-500">{files.length} file</p>
        </div>
        <div
          onClick={() => router.push('/shared')}
          className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
        >
          <Share2 className="text-purple-600 mb-3" size={24} />
          <h3 className="font-semibold text-gray-900">Shared</h3>
          <p className="text-sm text-gray-500">{files.filter(f => f.share_id).length} file dibagikan</p>
        </div>
        <div
          onClick={() => router.push('/trash')}
          className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
        >
          <Trash2 className="text-red-500 mb-3" size={24} />
          <h3 className="font-semibold text-gray-900">Trash</h3>
          <p className="text-sm text-gray-500">File yang dihapus</p>
        </div>
      </div>
    </div>
  )
        }
