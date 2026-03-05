import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useAuthStore } from '@/stores/authStore';

/**
 * Hook to access auth state and actions.
 * On web, bypasses Supabase auth and renders the app directly.
 */
export function useAuth() {
  const store = useAuthStore();

  useEffect(() => {
    if (Platform.OS === 'web') return;
    store.initialize();
  }, []);

  if (Platform.OS === 'web') {
    return {
      user: { id: 'web-demo', email: 'demo@pulse.app' } as any,
      session: { user: { id: 'web-demo' } } as any,
      isLoading: false,
      isAuthenticated: true,
      isOnboarded: true,
      signUp: store.signUp,
      signIn: store.signIn,
      signOut: store.signOut,
      updateProfile: store.updateProfile,
    };
  }

  return {
    user: store.user,
    session: store.session,
    isLoading: store.isLoading,
    isAuthenticated: !!store.session,
    isOnboarded: store.isOnboarded,
    signUp: store.signUp,
    signIn: store.signIn,
    signOut: store.signOut,
    updateProfile: store.updateProfile,
  };
}
