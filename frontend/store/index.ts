import { create } from 'zustand';
import { User, AuthResponse } from '@/types';

export function readStoredAuth() {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('auth');
    return stored ? JSON.parse(stored) : null;
  } catch {
    localStorage.removeItem('auth');
    return null;
  }
}

export function getStoredAccessToken() {
  return useAuthStore.getState().accessToken || readStoredAuth()?.accessToken || null;
}

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (response: AuthResponse) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthStore>((set) => {
  // Load from localStorage on initialization
  if (typeof window !== 'undefined') {
    const parsed = readStoredAuth();
    if (parsed) {
      return {
        user: parsed.user || null,
        accessToken: parsed.accessToken || null,
        refreshToken: parsed.refreshToken || null,
        isAuthenticated: !!parsed.accessToken,
        setAuth: (response: AuthResponse) => {
          localStorage.setItem(
            'auth',
            JSON.stringify({
              user: response.user,
              accessToken: response.accessToken,
              refreshToken: response.refreshToken,
            }),
          );
          set({
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
          });
        },
        logout: () => {
          localStorage.removeItem('auth');
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          });
        },
        setUser: (user: User) => {
          set({ user });
          const stored = localStorage.getItem('auth');
          if (stored) {
            const parsed = JSON.parse(stored);
            localStorage.setItem(
              'auth',
              JSON.stringify({
                ...parsed,
                user,
              }),
            );
          }
        },
      };
    }
  }

  return {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    setAuth: (response: AuthResponse) => {
      localStorage.setItem(
        'auth',
        JSON.stringify({
          user: response.user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        }),
      );
      set({
        user: response.user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        isAuthenticated: true,
      });
    },
    logout: () => {
      localStorage.removeItem('auth');
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
      });
    },
    setUser: (user: User) => {
      set({ user });
      const stored = localStorage.getItem('auth');
      if (stored) {
        const parsed = JSON.parse(stored);
        localStorage.setItem(
          'auth',
          JSON.stringify({
            ...parsed,
            user,
          }),
        );
      }
    },
  };
});

interface UIStore {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isDarkMode: false,
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  sidebarOpen: true,
  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
}));
