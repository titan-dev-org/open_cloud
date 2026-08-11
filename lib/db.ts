export interface FileRecord {
  id: string;
  name: string;
  key: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
  publicUrl: string;
  shareId?: string;
  sharePassword?: string;
  shareExpiry?: string;
}

const STORAGE_KEY = "cloud_storage_files";

export function getFiles(): FileRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveFile(file: FileRecord): FileRecord[] {
  const files = getFiles();
  files.unshift(file);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
  }
  return files;
}

export function deleteFile(id: string): FileRecord[] {
  const files = getFiles().filter(f => f.id !== id);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
  }
  return files;
}

export function updateFile(id: string, data: Partial<FileRecord>): FileRecord[] {
  const files = getFiles();
  const index = files.findIndex(f => f.id === id);
  if (index !== -1) {
    files[index] = { ...files[index], ...data };
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
    }
  }
  return files;
}

export function getFile(id: string): FileRecord | undefined {
  return getFiles().find(f => f.id === id);
}

// SHARE LINKS - Simpan di localStorage juga agar persist
const SHARE_STORAGE_KEY = "cloud_storage_shares";

interface ShareData {
  fileId: string;
  password?: string;
  expiry?: string;
  createdAt: string;
}

export function createShareLink(fileId: string, password?: string, expiry?: string): string {
  const shareId = Math.random().toString(36).substring(2, 10);
  
  const shares = getShares();
  shares[shareId] = {
    fileId,
    password,
    expiry,
    createdAt: new Date().toISOString(),
  };
  
  if (typeof window !== "undefined") {
    localStorage.setItem(SHARE_STORAGE_KEY, JSON.stringify(shares));
  }
  
  return shareId;
}

export function getShareData(shareId: string): { fileId: string; password?: string; expiry?: string } | undefined {
  const shares = getShares();
  const data = shares[shareId];
  if (!data) return undefined;
  
  // Cek expiry
  if (data.expiry && data.expiry !== "never") {
    const days = parseInt(data.expiry);
    const createdAt = new Date(data.createdAt);
    const now = new Date();
    const diffDays = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays > days) {
      return undefined; // Expired
    }
  }
  
  return {
    fileId: data.fileId,
    password: data.password,
    expiry: data.expiry,
  };
}

function getShares(): Record<string, ShareData> {
  if (typeof window === "undefined") return {};
  try {
    const data = localStorage.getItem(SHARE_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
      }
