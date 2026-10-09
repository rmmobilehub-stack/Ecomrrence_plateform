import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
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
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);

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

  const persistSession = async (token: string, profile: CustomerProfile) => {
    setAuthToken(token);
    await AsyncStorage.setItem(TOKEN_KEY, token);
    setCustomer(profile);
  };

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
        const data = await registerCustomer(payload);
        await persistSession(data.token, {
          id: data.customer.id,
          name: data.customer.name,
          email: data.customer.email,
          phone: data.customer.phone || '',
        });
      },
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
    [customer, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
