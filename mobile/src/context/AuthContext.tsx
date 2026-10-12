import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Linking } from 'react-native';
import {
  fetchCustomerMe,
  loginCustomer,
  logoutCustomer,
  registerCustomer,
} from '../api';
import { setAuthToken } from '../session';
import type { CustomerProfile } from '../types';

const TOKEN_KEY = 'shopsaas-customer-token';

type AuthContextValue = {
  customer: CustomerProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    name: string;
    phone?: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => Promise<void>;
  acceptSessionToken: (token: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function magicTokenFromUrl(url: string | null) {
  if (!url) return null;
  try {
    const parsed = new URL(url.replace(/^shopsaas:\/\//i, 'https://shopsaas/'));
    if (!/magic-login/i.test(parsed.hostname + parsed.pathname)) return null;
    const token = parsed.searchParams.get('token')?.trim();
    return token || null;
  } catch {
    const match = url.match(/[?&]token=([^&]+)/i);
    return match?.[1] ? decodeURIComponent(match[1]) : null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const persistSession = useCallback(async (token: string, profile: CustomerProfile) => {
    setAuthToken(token);
    await AsyncStorage.setItem(TOKEN_KEY, token);
    setCustomer(profile);
  }, []);

  const acceptSessionToken = useCallback(async (token: string) => {
    const trimmed = token.trim();
    if (!trimmed) throw new Error('Missing login token');
    setAuthToken(trimmed);
    await AsyncStorage.setItem(TOKEN_KEY, trimmed);
    const data = await fetchCustomerMe();
    if (!data.customer) {
      setAuthToken(null);
      await AsyncStorage.removeItem(TOKEN_KEY);
      throw new Error('Login link is invalid or expired');
    }
    setCustomer(data.customer);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        if (!token) {
          setAuthToken(null);
          return;
        }
        setAuthToken(token);
        const data = await fetchCustomerMe();
        if (cancelled) return;
        if (data.customer) {
          setCustomer(data.customer);
        } else {
          setAuthToken(null);
          await AsyncStorage.removeItem(TOKEN_KEY);
        }
      } catch {
        if (!cancelled) {
          setAuthToken(null);
          setCustomer(null);
          await AsyncStorage.removeItem(TOKEN_KEY).catch(() => undefined);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleUrl = (url: string | null) => {
      const token = magicTokenFromUrl(url);
      if (!token) return;
      void acceptSessionToken(token).catch(() => undefined);
    };

    Linking.getInitialURL()
      .then(handleUrl)
      .catch(() => undefined);
    const sub = Linking.addEventListener('url', event => handleUrl(event.url));
    return () => sub.remove();
  }, [acceptSessionToken]);

  const value = useMemo(
    () => ({
      customer,
      loading,
      login: async (email: string, password: string) => {
        const data = await loginCustomer(email.trim(), password);
        await persistSession(data.token, {
          id: data.customer.id,
          name: data.customer.name,
          email: data.customer.email,
          phone: data.customer.phone || '',
        });
      },
      register: async (payload: {
        name: string;
        phone?: string;
        email: string;
        password: string;
        confirmPassword: string;
      }) => {
        // Do not persist session — user must open the email magic-login link (opens the app).
        await registerCustomer(payload);
      },
      acceptSessionToken,
      logout: async () => {
        try {
          await logoutCustomer();
        } catch {
          // Clear local session even if API logout fails (offline / expired token).
        }
        setAuthToken(null);
        setCustomer(null);
        await AsyncStorage.removeItem(TOKEN_KEY);
      },
    }),
    [customer, loading, persistSession, acceptSessionToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
