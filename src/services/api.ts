import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

// On web, use localStorage; on native, use expo-secure-store
let storageAdapter: any;

if (Platform.OS === 'web') {
  storageAdapter = {
    getItem: async (key: string): Promise<string | null> => {
      try { return localStorage.getItem(key); } catch { return null; }
    },
    setItem: async (key: string, value: string): Promise<void> => {
      try { localStorage.setItem(key, value); } catch {}
    },
    removeItem: async (key: string): Promise<void> => {
      try { localStorage.removeItem(key); } catch {}
    },
  };
} else {
  // Lazy require to avoid importing on web where it's not available
  const SecureStore = require('expo-secure-store');
  storageAdapter = {
    getItem: async (key: string): Promise<string | null> => {
      try { return await SecureStore.getItemAsync(key); } catch { return null; }
    },
    setItem: async (key: string, value: string): Promise<void> => {
      try { await SecureStore.setItemAsync(key, value); } catch {}
    },
    removeItem: async (key: string): Promise<void> => {
      try { await SecureStore.deleteItemAsync(key); } catch {}
    },
  };
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: storageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
