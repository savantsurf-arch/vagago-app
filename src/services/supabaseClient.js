import { createClient } from '@supabase/supabase-js';

const defaultUrl = 'https://cmnkbpwxaxaktrylmnyi.supabase.co';
const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtbmticHd4YXhha3RyeWxtbnlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2MzQxMDYsImV4cCI6MjEwMjIxMDEwNn0.h-uqDusMt5zyzOAyEW2VMo0K0Vm-wHK2OiJSyJ9xpy8';

const envUrl = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_URL : defaultUrl;
const envKey = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_ANON_KEY : defaultKey;

const supabaseUrl = envUrl || defaultUrl;
const supabaseAnonKey = envKey || defaultKey;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey &&
  !supabaseUrl.includes('sua-url-demo')
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const fetchUsersFromSupabase = async () => {
  try {
    const { data, error } = await supabase.from('users').select('*');
    if (error) {
      console.warn("Supabase fetch users notice:", error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn("Supabase connection notice:", err);
    return [];
  }
};
