import { supabase, FileRecord, ShareRecord } from './supabase';

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

export async function saveMultipleFiles(files: FileRecord[]): Promise<FileRecord[]> {
  const { data, error } = await supabase
    .from('files')
    .insert(files)
    .select();

  if (error) {
    console.error('Error saving files:', error);
    throw error;
  }

  return data || [];
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

export async function getFile(id: string): Promise<FileRecord | null> {
  const { data, error } = await supabase
    .from('files')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching file:', error);
    return null;
  }

  return data;
}

export async function getFilesByIds(ids: string[]): Promise<FileRecord[]> {
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

// ============ SHARE OPERATIONS (MULTI-FILE) ============

export async function createShareLink(
  fileIds: string[], 
  password?: string, 
  expiry?: string
): Promise<string> {
  const shareId = Math.random().toString(36).substring(2, 10);
  
  let expiresAt = null;
  if (expiry && expiry !== 'never') {
    const days = parseInt(expiry);
    const date = new Date();
    date.setDate(date.getDate() + days);
    expiresAt = date.toISOString();
  }

  // Simpan ke tabel shares dengan array file_ids
  const { error: shareError } = await supabase
    .from('shares')
    .insert([{
      id: shareId,
      file_ids: fileIds, // array of file ids
      password: password || null,
      expiry: expiry || 'never',
      expires_at: expiresAt,
      downloads: 0,
    }]);

  if (shareError) {
    console.error('Error creating share:', shareError);
    throw shareError;
  }

  // Update each file with share_id
  for (const fileId of fileIds) {
    await updateFile(fileId, { 
      share_id: shareId,
      share_password: password,
      share_expiry: expiry,
      share_created_at: new Date().toISOString(),
    });
  }

  return shareId;
}

export async function getShareData(shareId: string): Promise<{
  fileIds: string[];
  password?: string;
  expiry?: string;
  files?: FileRecord[];
} | null> {
  const { data: share, error: shareError } = await supabase
    .from('shares')
    .select('*')
    .eq('id', shareId)
    .single();

  if (shareError || !share) {
    console.error('Share not found:', shareError);
    return null;
  }

  if (share.expires_at) {
    const expiryDate = new Date(share.expires_at);
    if (expiryDate < new Date()) {
      return null;
    }
  }

  if (share.max_downloads && share.downloads >= share.max_downloads) {
    return null;
  }

  // Get all files
  const files = await getFilesByIds(share.file_ids || []);

  return {
    fileIds: share.file_ids || [],
    password: share.password,
    expiry: share.expiry,
    files,
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
    .update({ downloads: share.downloads + 1 })
    .eq('id', shareId);

  if (updateError) {
    console.error('Error incrementing downloads:', updateError);
  }
    }
