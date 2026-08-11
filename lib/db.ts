// Simulasi database menggunakan localStorage
// Untuk production, ganti dengan database sungguhan

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

// Untuk share link (simpan di memory karena di server)
// Dalam production, ini pakai database
const shareLinks = new Map<string, { fileId: string; password?: string; expiry?: string }>();

export function createShareLink(fileId: string, password?: string, expiry?: string): string {
  const shareId = Math.random().toString(36).substring(2, 10);
  shareLinks.set(shareId, { fileId, password, expiry });
  return shareId;
}

export function getShareData(shareId: string): { fileId: string; password?: string; expiry?: string } | undefined {
  return shareLinks.get(shareId);
      }
