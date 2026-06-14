import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Apenas um alerta no console para ajudar durante o desenvolvimento
  console.warn('Variáveis VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY não configuradas no .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
