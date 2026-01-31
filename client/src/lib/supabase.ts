/**
 * Supabase Client Configuration
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ymcjoloqemofuhiomdgk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltY2pvbG9xZW1vZnVoaW9tZGdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4MzAxMjQsImV4cCI6MjA4NTQwNjEyNH0.WmkqB1Ro9iVBB8w1NTr7Oy8a0CXqtMH-Zb1CS38wSGc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Database Types
export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  drama_source: 'dramacool' | 'kissasian';
  drama_id: string;
  drama_title: string;
  drama_image: string | null;
  created_at: string;
}

export interface WatchHistory {
  id: string;
  user_id: string;
  drama_source: 'dramacool' | 'kissasian';
  drama_id: string;
  drama_title: string;
  drama_image: string | null;
  episode: string;
  progress: number;
  duration: number;
  last_watched_at: string;
  created_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  theme: 'light' | 'dark';
  language: string;
  auto_play: boolean;
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminSettings {
  id: string;
  key: string;
  value: any;
  updated_by: string | null;
  updated_at: string;
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  event_type: string;
  user_id: string | null;
  metadata: Record<string, any>;
  created_at: string;
}
