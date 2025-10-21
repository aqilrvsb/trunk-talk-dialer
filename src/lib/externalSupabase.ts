import { createClient } from '@supabase/supabase-js';

// External Supabase database for SIP accounts
const EXTERNAL_SUPABASE_URL = 'https://ahexnoaazbveiyhplfrc.supabase.co';
const EXTERNAL_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoZXhub2FhemJ2ZWl5aHBsZnJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNDMwMjIsImV4cCI6MjA3NTgxOTAyMn0.YP3WpbXFvqDzAO9XwQyXnQzZaBgtGqxIJ32-7aZ_5GQ';

export interface SIPAccount {
  id: string;
  user_id: string;
  account_name: string;
  sip_server: string;
  sip_username: string;
  sip_password: string;
  display_name: string | null;
  phone_number: string | null;
  is_connected: boolean;
  created_at: string;
  updated_at: string;
}

export const externalSupabase = createClient(EXTERNAL_SUPABASE_URL, EXTERNAL_SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
