import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '@/types';
import { dummyUsers } from '@/lib/dummyData';

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, _password: string) => Promise<User>;
  register: (name: string, email: string, _password: string, role: UserRole) => Promise<User>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: async (email) => {
        // Simulated auth — matches against dummy users, falls back to a demo customer
        await new Promise((r) => setTimeout(r, 600));
        const found = dummyUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
        const user: User = found || {
          id: 'demo-' + Date.now(),
          name: email.split('@')[0],
          email,
          role: 'customer',
          createdAt: new Date().toISOString(),
        };
        const token = 'demo-token-' + Math.random().toString(36).slice(2);
        set({ user, token, isAuthenticated: true });
        return user;
      },
      register: async (name, email, _password, role) => {
        await new Promise((r) => setTimeout(r, 600));
        const user: User = {
          id: 'new-' + Date.now(),
          name,
          email,
          role,
          createdAt: new Date().toISOString(),
        };
        const token = 'demo-token-' + Math.random().toString(36).slice(2);
        set({ user, token, isAuthenticated: true });
        return user;
      },
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      updateProfile: (data) => {
        const current = get().user;
        if (!current) return;
        set({ user: { ...current, ...data } });
      },
    }),
    { name: 'sh-auth' }
  )
);
