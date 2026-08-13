export interface FileRecord {
  id: string
  name: string
  key: string
  size: number
  mime_type: string
  uploaded_at: string
  public_url: string
  user_id?: string
  folder_id?: string | null
  is_encrypted?: boolean
  is_starred?: boolean
  share_id?: string | null
  share_password?: string | null
  share_expiry?: string | null
  share_created_at?: string | null
  deleted_at?: string | null
  created_at?: string
  updated_at?: string
}

export interface FolderRecord {
  id: string
  name: string
  user_id: string
  parent_id?: string | null
  is_starred?: boolean
  created_at?: string
  updated_at?: string
}

export interface ProfileRecord {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  storage_used: number
  storage_limit: number
  created_at?: string
  updated_at?: string
}

export interface ShareRecord {
  id: string
  file_ids: string[]
  user_id: string
  password?: string
  expiry?: string
  expires_at?: string
  downloads: number
  max_downloads?: number
  created_at?: string
}

export interface Stats {
  totalFiles: number
  totalSize: number
  totalShares: number
  }
