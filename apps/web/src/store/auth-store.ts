import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../lib/api';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'volunteer' | 'ngo_coordinator' | 'admin' | 'donor' | 'community' | 'platform_admin' | string;
  avatar?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setCredentials: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: true,

      setCredentials: (token, user) => {
        set({ token, user, isAuthenticated: true, isLoading: false });
      },

      logout: () => {
        set({ token: null, user: null, isAuthenticated: false, isLoading: false });
      },

      updateUser: (updatedData) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...updatedData } });
        }
      },

      initialize: async () => {
        const { token } = get();
        if (!token) {
          set({ isLoading: false });
          return;
        }

        try {
          // Verify token and fetch latest user data
          const response = await api.get('/auth/me');
          if (response.data.success) {
            set({ user: response.data.data, isAuthenticated: true, isLoading: false });
          } else {
            // Token is invalid
            set({ token: null, user: null, isAuthenticated: false, isLoading: false });
          }
        } catch (error) {
          console.error('Auth initialization failed', error);
          set({ token: null, user: null, isAuthenticated: false, isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage', // key in local storage
      partialize: (state) => ({ token: state.token, user: state.user }), // Only persist token & user
    }
  )
);
