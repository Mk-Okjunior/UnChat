import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';

// Demo-first mode: keep the app working without a live Supabase connection.
export const isSupabaseConfigured = false;

const configuredSupabaseUrl = supabaseUrl && !supabaseUrl.includes('not-configured') ? supabaseUrl : '';
const configuredSupabaseKey = supabaseKey && !supabaseKey.includes('not-configured') ? supabaseKey : '';

const authStorage = {
  getItem: async (key: string) => {
    if (Platform.OS !== 'web') return AsyncStorage.getItem(key);
    return typeof window === 'undefined' ? null : window.localStorage.getItem(key);
  },
  setItem: async (key: string, value: string) => {
    if (Platform.OS !== 'web') return AsyncStorage.setItem(key, value);
    if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    if (Platform.OS !== 'web') return AsyncStorage.removeItem(key);
    if (typeof window !== 'undefined') window.localStorage.removeItem(key);
  },
};

export function requireSupabaseConfig() {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase haijaunganishwa. Weka URL na publishable key kwenye faili la .env.');
  }
}

export const supabase = createClient(
  configuredSupabaseUrl || 'https://unchat-not-configured.supabase.co',
  configuredSupabaseKey || 'not-configured',
  {
    auth: {
      storage: authStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);
