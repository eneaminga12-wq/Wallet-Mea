import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { User } from '../types';
import { DEMO_USER } from '../data/mock';
import { authService } from '../services/authService';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (identifier?: string, password?: string) => Promise<void>;
  register: (payload: {
    fullName: string;
    phone: string;
    email: string;
    password: string;
    country: string;
  }) => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const SESSION_KEY = 'meabit.session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) return JSON.parse(saved);
      // For simplicity: auto-authenticated with demo user, no credentials required
      return DEMO_USER;
    } catch {
      return DEMO_USER;
    }
  });
  const [loading, setLoading] = useState(false);

  const persist = useCallback((u: User | null) => {
    setUser(u);
    try {
      if (u) localStorage.setItem(SESSION_KEY, JSON.stringify(u));
      else localStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const login = useCallback(
    async (identifier: string = 'demo', password: string = 'demo') => {
      setLoading(true);
      try {
        const u = await authService.login({ identifier: identifier || 'demo', password: password || 'demo' });
        persist(u);
      } finally {
        setLoading(false);
      }
    },
    [persist]
  );

  const register = useCallback(
    async (payload: { fullName: string; phone: string; email: string; password: string; country: string }) => {
      setLoading(true);
      try {
        const { user: u } = await authService.register(payload);
        persist(u);
      } finally {
        setLoading(false);
      }
    },
    [persist]
  );

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
      } catch {
        /* ignore */
      }
      return updated;
    });
  }, []);

  const logout = useCallback(() => persist(null), [persist]);

  const value = useMemo(
    () => ({ user, loading, login, register, updateUser, logout }),
    [user, loading, login, register, updateUser, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
