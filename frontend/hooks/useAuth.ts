import { create } from 'zustand';
import { useEffect, useState } from 'react';
import { blink } from '@/lib/blink';

interface AuthState {
  user: { id: string; email?: string } | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: { id: string; email?: string } | null) => void;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
}));

export function useAuth() {
  const { user, isLoading, isAuthenticated, setUser } = useAuthStore();
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsub = blink.auth.onAuthStateChanged((state) => {
      if (!state.isLoading) {
        const u = state.user ? { id: state.user.id, email: state.user.email } : null;
        setUser(u);
        setAuthLoading(false);
      }
    });
    return unsub;
  }, []);

  const signUp = async (email: string, password: string) => {
    await blink.auth.signUp({ email, password });
  };

  const signIn = async (email: string, password: string) => {
    await blink.auth.signInWithEmail(email, password);
  };

  const signOut = async () => {
    await blink.auth.signOut();
    setUser(null);
  };

  return {
    user,
    isLoading: authLoading,
    isAuthenticated,
    signUp,
    signIn,
    signOut,
  };
}
