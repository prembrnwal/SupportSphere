import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '@/types';
import { dummyUsers } from '@/lib/dummyData';
import { api } from '@/lib/axios';

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<User>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: async (email, password) => {
        try {
          const res = await api.post('/api/v1/auth/login', { email, password });
          if (res.data?.success && res.data?.data) {
            const { user: rawUser, token } = res.data.data;
            const roleStr = String(rawUser.role || 'CUSTOMER').toLowerCase();
            const role: UserRole = roleStr === 'admin' ? 'admin' : 'customer';
            const user: User = {
              id: rawUser.id,
              name: rawUser.name,
              email: rawUser.email,
              role,
              avatarUrl: rawUser.avatar_url,
              createdAt: rawUser.created_at || new Date().toISOString(),
            };
            localStorage.setItem('sh_token', token);
            set({ user, token, isAuthenticated: true });
            return user;
          }
        } catch (err: any) {
          if (err.response?.data?.message) {
            throw new Error(err.response.data.message);
          }
        }

        // Demo fallback if backend is offline
        await new Promise((r) => setTimeout(r, 400));
        const found = dummyUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
        const userRole: UserRole = email.toLowerCase().includes('admin') ? 'admin' : 'customer';

        const user: User = found || {
          id: 'demo-' + Date.now(),
          name: email.split('@')[0].replace('.', ' '),
          email,
          role: userRole,
          createdAt: new Date().toISOString(),
        };
        const token = 'demo-token-' + Math.random().toString(36).slice(2);
        localStorage.setItem('sh_token', token);
        set({ user, token, isAuthenticated: true });
        return user;
      },
      register: async (name, email, password, role) => {
        try {
          const backendRole = role === 'admin' ? 'ADMIN' : 'CUSTOMER';
          const res = await api.post('/api/v1/auth/register', { name, email, password, role: backendRole });
          if (res.data?.success && res.data?.data) {
            const { user: rawUser, token } = res.data.data;
            const roleStr = String(rawUser.role || 'CUSTOMER').toLowerCase();
            const r: UserRole = roleStr === 'admin' ? 'admin' : 'customer';
            const user: User = {
              id: rawUser.id,
              name: rawUser.name,
              email: rawUser.email,
              role: r,
              avatarUrl: rawUser.avatar_url,
              createdAt: rawUser.created_at || new Date().toISOString(),
            };
            localStorage.setItem('sh_token', token);
            set({ user, token, isAuthenticated: true });
            return user;
          }
        } catch (err: any) {
          if (err.response?.data?.message) {
            throw new Error(err.response.data.message);
          }
        }

        await new Promise((r) => setTimeout(r, 400));
        const user: User = {
          id: 'new-' + Date.now(),
          name,
          email,
          role,
          createdAt: new Date().toISOString(),
        };
        const token = 'demo-token-' + Math.random().toString(36).slice(2);
        localStorage.setItem('sh_token', token);
        set({ user, token, isAuthenticated: true });
        return user;
      },
      logout: () => {
        localStorage.removeItem('sh_token');
        set({ user: null, token: null, isAuthenticated: false });
      },
      updateProfile: (data) => {
        const current = get().user;
        if (!current) return;
        set({ user: { ...current, ...data } });
      },
    }),
    { name: 'sh-auth' }
  )
);
