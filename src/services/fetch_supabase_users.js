import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Defina VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY nas variáveis de ambiente.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function fetchUsers() {
  const { data: users, error } = await supabase
    .from('users')
    .select('id, name, email, role, status, created_at');
  if (error) {
    console.error('Error fetching users:', error.message);
    process.exit(1);
  }
  console.log('Users count in Supabase:', users?.length || 0);
}

fetchUsers();
