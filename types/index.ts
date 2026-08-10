export interface UploadResponse {
  presignedUrl: string;
  fileKey: string;
  publicUrl: string;
}

export interface ShareResponse {
  shareUrl: string;
  shareId: string;
}

export interface ShareAccessResponse {
  downloadUrl: string;
  fileKey: string;
}
