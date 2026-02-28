import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const SUPABASE_URL = 'https://egoczxrubrgerzceibjp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnb2N6eHJ1YnJnZXJ6Y2VpYmpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMTYwMjYsImV4cCI6MjA4Nzc5MjAyNn0.-12rFi6cBf-PftxmY885XqfmtvBp_xPHEZ284sAoZRk';

// Lazily-loaded SecureStore (native only)
let _SecureStore: typeof import('expo-secure-store') | null = null;
let _secureStoreLoaded = false;

async function getSecureStore() {
  if (_secureStoreLoaded) return _SecureStore;
  _secureStoreLoaded = true;
  if (Platform.OS === 'web') return null;
  try {
    _SecureStore = await import('expo-secure-store');
  } catch {
    // expo-secure-store not available
  }
  return _SecureStore;
}

// Kick off loading immediately on native
getSecureStore();

// Web-safe storage adapter: localStorage on web, SecureStore on native
const StorageAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(key);
      }
      const store = await getSecureStore();
      if (!store) return null;
      return await store.getItemAsync(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(key, value);
        return;
      }
      const store = await getSecureStore();
      if (!store) return;
      await store.setItemAsync(key, value);
    } catch {
      // Silently fail
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(key);
        return;
      }
      const store = await getSecureStore();
      if (!store) return;
      await store.deleteItemAsync(key);
    } catch {
      // Silently fail
    }
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: StorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
