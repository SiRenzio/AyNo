import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';

import { api } from '@/lib/api';
import { sessionStorage } from '@/lib/session-storage';
import { User } from '@/lib/types';

const TOKEN_KEY = 'ayno_mobile_token';

type Credentials = { login: string; password: string };
type AuthContextValue = {
  token: string | null;
  user: User | null;
  loading: boolean;
  signIn: (data: Credentials) => Promise<void>;
  signUp: (data: { username: string; email: string; password: string; password_confirmation: string }) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const savedToken = await sessionStorage.get(TOKEN_KEY);

      if (savedToken) {
        try {
          const result = await api<{ user: User }>('/me', {}, savedToken);
          setToken(savedToken);
          setUser(result.user);
        } catch {
          await sessionStorage.remove(TOKEN_KEY);
        }
      }

      setLoading(false);
    })();
  }, []);

  async function authenticate(path: '/login' | '/register', data: object) {
    const result = await api<{ token: string; user: User }>(path, {
      method: 'POST',
      body: JSON.stringify({ ...data, device_name: 'AyNo mobile' }),
    });

    await sessionStorage.set(TOKEN_KEY, result.token);
    setToken(result.token);
    setUser(result.user);
  }

  async function signOut() {
    try {
      await api('/logout', { method: 'POST' }, token);
    } finally {
      await sessionStorage.remove(TOKEN_KEY);
      setToken(null);
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        signIn: (data) => authenticate('/login', data),
        signUp: (data) => authenticate('/register', data),
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
