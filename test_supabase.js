import { createClient } from '@supabase/supabase-js';
import { seedInitialSpacesToSupabase, fetchSpacesFromSupabase } from './src/services/supabaseService.js';

async function seed() {
  console.log("=== POPULANDO BANCO DE DADOS SUPABASE COM VAGAS DE ITABUNA - BA ===");
  await seedInitialSpacesToSupabase();
  const spaces = await fetchSpacesFromSupabase();
  console.log("✅ TOTAL DE VAGAS NO SUPABASE APÓS SEEDING:", spaces ? spaces.length : 0);
}

seed();
