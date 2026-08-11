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

// ============ SHARE OPERATIONS ============

export async function createShareLink(
  fileId: string, 
  password?: string, 
  expiry?: string
): Promise<string> {
  // Generate share ID
  const shareId = Math.random().toString(36).substring(2, 10);
  
  // Calculate expiry date
  let expiresAt = null;
  if (expiry && expiry !== 'never') {
    const days = parseInt(expiry);
    const date = new Date();
    date.setDate(date.getDate() + days);
    expiresAt = date.toISOString();
  }

  // Insert share record
  const { error: shareError } = await supabase
    .from('shares')
    .insert([{
      id: shareId,
      file_id: fileId,
      password: password || null,
      expiry: expiry || 'never',
      expires_at: expiresAt,
      downloads: 0,
    }]);

  if (shareError) {
    console.error('Error creating share:', shareError);
    throw shareError;
  }

  // Update file with share_id
  await updateFile(fileId, { 
    share_id: shareId,
    share_password: password,
    share_expiry: expiry,
    share_created_at: new Date().toISOString(),
  });

  return shareId;
}

export async function getShareData(shareId: string): Promise<{
  fileId: string;
  password?: string;
  expiry?: string;
  file?: FileRecord;
} | null> {
  // Get share record
  const { data: share, error: shareError } = await supabase
    .from('shares')
    .select('*')
    .eq('id', shareId)
    .single();

  if (shareError || !share) {
    console.error('Share not found:', shareError);
    return null;
  }

  // Check expiry
  if (share.expires_at) {
    const expiryDate = new Date(share.expires_at);
    if (expiryDate < new Date()) {
      return null; // Expired
    }
  }

  // Check max downloads
  if (share.max_downloads && share.downloads >= share.max_downloads) {
    return null; // Max downloads reached
  }

  // Get file data
  const { data: file, error: fileError } = await supabase
    .from('files')
    .select('*')
    .eq('id', share.file_id)
    .single();

  if (fileError || !file) {
    console.error('File not found:', fileError);
    return null;
  }

  return {
    fileId: share.file_id,
    password: share.password,
    expiry: share.expiry,
    file,
  };
}

export async function incrementDownloads(shareId: string): Promise<void> {
  const { error } = await supabase
    .from('shares')
    .update({ downloads: supabase.rpc('increment', { row_id: shareId }) })
    .eq('id', shareId);

  if (error) {
    console.error('Error incrementing downloads:', error);
  }
    }
