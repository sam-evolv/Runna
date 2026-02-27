import { create } from 'zustand';
import { supabase, isDevMode } from '@/services/api';
import type { User } from '@/types/user';

interface AuthState {
  user: User | null;
  session: any | null;
  isLoading: boolean;
  isOnboarded: boolean;

  // Actions
  initialize: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<{ error?: string }>;
  setOnboarded: (value: boolean) => void;
}

function createDevUser(email: string): User {
  return {
    id: 'dev-user-001',
    email,
    full_name: 'Dev User',
    date_of_birth: null,
    gender: null,
    height_cm: null,
    weight_kg: null,
    unit_preference: 'metric',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

const devSession = { access_token: 'dev-token', user: { id: 'dev-user-001' } };

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  isOnboarded: false,

  initialize: async () => {
    if (isDevMode) {
      set({ isLoading: false });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        // Check if user has an active goal (means they've completed onboarding)
        const { data: goals } = await supabase
          .from('goals')
          .select('id')
          .eq('user_id', session.user.id)
          .eq('status', 'active')
          .limit(1);

        set({
          session,
          user: profile || null,
          isOnboarded: (goals?.length ?? 0) > 0,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        set({ user: null, session: null, isOnboarded: false });
      } else if (session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        set({ session, user: profile || null });
      }
    });
  },

  signUp: async (email, password) => {
    if (isDevMode) {
      set({ user: createDevUser(email), session: devSession, isOnboarded: false });
      return {};
    }

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };

    if (data.user) {
      // Create user profile
      const { error: profileError } = await supabase.from('users').insert({
        id: data.user.id,
        email,
      });
      if (profileError) return { error: profileError.message };

      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      set({ user: profile, session: data.session });
    }
    return {};
  },

  signIn: async (email, password) => {
    if (isDevMode) {
      set({ user: createDevUser(email), session: devSession, isOnboarded: false });
      return {};
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };

    if (data.user) {
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      const { data: goals } = await supabase
        .from('goals')
        .select('id')
        .eq('user_id', data.user.id)
        .eq('status', 'active')
        .limit(1);

      set({
        user: profile,
        session: data.session,
        isOnboarded: (goals?.length ?? 0) > 0,
      });
    }
    return {};
  },

  signOut: async () => {
    if (!isDevMode) {
      await supabase.auth.signOut();
    }
    set({ user: null, session: null, isOnboarded: false });
  },

  updateProfile: async (updates) => {
    const user = get().user;
    if (!user) return { error: 'Not logged in' };

    if (isDevMode) {
      set({ user: { ...user, ...updates } });
      return {};
    }

    const { error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (error) return { error: error.message };

    set({ user: { ...user, ...updates } });
    return {};
  },

  setOnboarded: (value) => set({ isOnboarded: value }),
}));
