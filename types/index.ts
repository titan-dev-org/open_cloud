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

export interface UploadResponse {
  presignedUrl: string;
  fileKey: string;
  publicUrl: string;
}

export interface ShareResponse {
  shareUrl: string;
  shareId: string;
}

export interface Stats {
  totalFiles: number;
  totalSize: number;
  totalShares: number;
}
