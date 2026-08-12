import { supabase, FileRecord } from './supabase';

// ============ FILE OPERATIONS ============

export async function getFiles(): Promise<FileRecord[]> {
  const { data, error } = await supabase
    .from('files')
    .select('*')
    .order('uploaded_at', { ascending: false });

  if (error) {
    console.error('Error fetching files:', error);
    return [];
  }

  return data || [];
}

export async function saveFile(file: FileRecord): Promise<FileRecord> {
  const { data, error } = await supabase
    .from('files')
    .insert([file])
    .select()
    .single();

  if (error) {
    console.error('Error saving file:', error);
    throw error;
  }

  return data;
}

export async function deleteFile(id: string): Promise<void> {
  const { error } = await supabase
    .from('files')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

export async function updateFile(id: string, data: Partial<FileRecord>): Promise<FileRecord> {
  const { data: updated, error } = await supabase
    .from('files')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating file:', error);
    throw error;
  }

  return updated;
}

export async function getFilesByIds(ids: string[]): Promise<FileRecord[]> {
  if (!ids || ids.length === 0) return [];
  
  const { data, error } = await supabase
    .from('files')
    .select('*')
    .in('id', ids)
    .order('uploaded_at', { ascending: false });

  if (error) {
    console.error('Error fetching files by ids:', error);
    return [];
  }

  return data || [];
}

// ============ SHARE OPERATIONS ============

export async function createShareLink(
  fileIds: string[], 
  password?: string, 
  expiry?: string
): Promise<string> {
  if (!fileIds || fileIds.length === 0) {
    throw new Error("Minimal 1 file harus dipilih");
  }

  console.log("📦 Creating share for files:", fileIds);

  const shareId = Math.random().toString(36).substring(2, 10);
  
  let expiresAt = null;
  if (expiry && expiry !== 'never') {
    const days = parseInt(expiry);
    const date = new Date();
    date.setDate(date.getDate() + days);
    expiresAt = date.toISOString();
  }

  // Insert ke tabel shares
  const { error: shareError } = await supabase
    .from('shares')
    .insert({
      id: shareId,
      file_ids: fileIds,
      password: password || null,
      expiry: expiry || 'never',
      expires_at: expiresAt,
      downloads: 0,
    });

  if (shareError) {
    console.error('❌ Error creating share:', shareError);
    throw shareError;
  }

  console.log("✅ Share created:", shareId);

  // Update each file dengan share_id
  for (const fileId of fileIds) {
    const { error: updateError } = await supabase
      .from('files')
      .update({ 
        share_id: shareId,
        share_password: password,
        share_expiry: expiry,
        share_created_at: new Date().toISOString(),
      })
      .eq('id', fileId);

    if (updateError) {
      console.error('Error updating file:', fileId, updateError);
    }
  }

  return shareId;
}

export async function getShareData(shareId: string): Promise<{
  fileIds: string[];
  password?: string;
  expiry?: string;
  files: FileRecord[];
} | null> {
  console.log("🔍 Getting share data for:", shareId);

  const { data: share, error: shareError } = await supabase
    .from('shares')
    .select('*')
    .eq('id', shareId)
    .single();

  if (shareError || !share) {
    console.error('Share not found:', shareError);
    return null;
  }

  console.log("📦 Share data:", share);

  // Cek expiry
  if (share.expires_at) {
    const expiryDate = new Date(share.expires_at);
    if (expiryDate < new Date()) {
      console.log("⏰ Share expired");
      return null;
    }
  }

  // Ambil file_ids dari share
  const fileIds = share.file_ids || [];
  console.log("📁 File IDs:", fileIds);
  
  if (fileIds.length === 0) {
    console.log("❌ No files in share");
    return null;
  }

  // Ambil semua file berdasarkan ids
  const files = await getFilesByIds(fileIds);
  console.log("📁 Files found:", files.length);

  return {
    fileIds: fileIds,
    password: share.password,
    expiry: share.expiry,
    files: files,
  };
}

export async function incrementDownloads(shareId: string): Promise<void> {
  const { data: share, error: getError } = await supabase
    .from('shares')
    .select('downloads')
    .eq('id', shareId)
    .single();

  if (getError || !share) {
    console.error('Error getting share:', getError);
    return;
  }

  const { error: updateError } = await supabase
    .from('shares')
    .update({ downloads: (share.downloads || 0) + 1 })
    .eq('id', shareId);

  if (updateError) {
    console.error('Error incrementing downloads:', updateError);
  }
      }
