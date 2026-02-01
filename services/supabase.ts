
import { createClient } from '@supabase/supabase-js';

// ============================================================================
// INSTRUCTIONS:
// 1. Create a project at https://supabase.com
// 2. Go to Project Settings > API
// 3. Replace the placeholder values below with your URL and "anon" public key.
// ============================================================================

const SUPABASE_URL = 'https://qyrskksctwtdatyvmgpb.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5cnNra3NjdHd0ZGF0eXZtZ3BiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5Mjc3NzAsImV4cCI6MjA4NTUwMzc3MH0.qlMzzul0VwbwVxsDxp8OI_zShLiM9it474HY9578cFA'; 

// Check if keys are configured
const isConfigured = SUPABASE_URL && SUPABASE_KEY && !SUPABASE_URL.includes('your-project');

if (!isConfigured) {
  console.warn("⚠️ ArenaOS: Supabase keys are missing or default in services/supabase.ts. App running in offline mock mode.");
}

export const supabase = isConfigured 
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

export const checkSupabaseConnection = async () => {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('resources').select('count', { count: 'exact', head: true });
    return !error;
  } catch (e) {
    return false;
  }
};
