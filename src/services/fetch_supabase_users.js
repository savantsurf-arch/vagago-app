import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cmnkbpwxaxaktrylmnyi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtbmticHd4YXhha3RyeWxtbnlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2MzQxMDYsImV4cCI6MjEwMjIxMDEwNn0.h-uqDusMt5zyzOAyEW2VMo0K0Vm-wHK2OiJSyJ9xpy8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fetchUsers() {
  console.log("Fetching users from Supabase Cloud...");
  const { data: users, error } = await supabase.from('users').select('*');
  if (error) {
    console.error("Error fetching users:", error);
  } else {
    console.log("Users count in Supabase:", users?.length);
    console.log("Users Data:", JSON.stringify(users, null, 2));
  }
}

fetchUsers();
