import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate URL format
const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Enhanced validation with detailed logging
const validateSupabaseConfig = () => {
  if (!supabaseUrl) {
    console.warn('VITE_SUPABASE_URL not found in environment variables. Running in offline mode.');
    return false;
  }
  
  if (!supabaseAnonKey) {
    console.warn('VITE_SUPABASE_ANON_KEY not found in environment variables. Running in offline mode.');
    return false;
  }
  
  if (!isValidUrl(supabaseUrl)) {
    console.warn(`Invalid Supabase URL format: ${supabaseUrl}. Running in offline mode.`);
    return false;
  }
  
  console.log('Supabase configuration validated successfully.');
  return true;
};

const isConfigValid = validateSupabaseConfig();

export const supabase = isConfigValid
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseEnabled = !!supabase;

// Helper function to check connection status
export const checkSupabaseConnection = async (): Promise<boolean> => {
  if (!supabase) return false;
  
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    return !error;
  } catch (error) {
    console.warn('Supabase connection test failed:', error);
    return false;
  }
};