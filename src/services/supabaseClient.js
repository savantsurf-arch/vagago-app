import { createClient } from '@supabase/supabase-js';

const envUrl =
  typeof import.meta !== 'undefined' && import.meta.env
    ? (import.meta.env.VITE_SUPABASE_URL || '').trim()
    : '';
const envKey =
  typeof import.meta !== 'undefined' && import.meta.env
    ? (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim()
    : '';

export const isSupabaseConfigured = Boolean(
  envUrl &&
  envKey &&
  !envUrl.includes('seu-projeto') &&
  !envKey.includes('sua-chave')
);

export const supabase = isSupabaseConfigured
  ? createClient(envUrl, envKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-anon-key');

export const fetchUsersFromSupabase = async () => {
  if (!isSupabaseConfigured) return [];
  try {
    // Projeta apenas campos não-sensíveis no cliente (sem CPF ou dados bancários)
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, avatar, status, created_at');
    if (error) {
      console.warn('Supabase fetch users notice:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn('Supabase connection notice:', err?.message || err);
    return [];
  }
};
