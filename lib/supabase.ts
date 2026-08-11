import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface FileRecord {
  id: string;
  name: string;
  key: string;
  size: number;
  mime_type: string;
  uploaded_at: string;
  public_url: string;
  share_id?: string;
  share_password?: string;
  share_expiry?: string;
  share_created_at?: string;
}

export interface ShareRecord {
  id: string;
  file_id: string;
  password?: string;
  expiry?: string;
  downloads: number;
  max_downloads?: number;
  created_at: string;
  expires_at?: string;
}
