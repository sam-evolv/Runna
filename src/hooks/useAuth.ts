import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

/**
 * Hook to access auth state and actions.
 */
export function useAuth() {
  const store = useAuthStore();

  useEffect(() => {
    store.initialize();
  }, []);

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
