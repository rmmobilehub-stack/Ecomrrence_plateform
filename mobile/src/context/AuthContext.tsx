import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { fetchCustomerMe, loginCustomer, logoutCustomer, registerCustomer } from '../api';
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
    AsyncStorage.getItem(TOKEN_KEY)
      .then(async token => {
        if (!token) return;
        setAuthToken(token);
        const data = await fetchCustomerMe();
        if (data.customer) {
          setCustomer(data.customer);
        } else {
          setAuthToken(null);
          await AsyncStorage.removeItem(TOKEN_KEY);
        }
      })
      .catch(() => {
        setAuthToken(null);
        setCustomer(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const persist = async (token: string, profile: CustomerProfile) => {
    setAuthToken(token);
    await AsyncStorage.setItem(TOKEN_KEY, token);
    setCustomer(profile);
  };

  const value = useMemo(
    () => ({
      customer,
      loading,
      login: async (email: string, password: string) => {
        const data = await loginCustomer(email, password);
        if (!data.token) throw new Error('Login did not return a session token');
        await persist(data.token, data.customer);
      },
      register: async payload => {
        const data = await registerCustomer(payload);
        if (!data.token) throw new Error('Register did not return a session token');
        await persist(data.token, data.customer);
      },
      logout: async () => {
        try {
          await logoutCustomer();
        } catch {
          // Local logout still proceeds if the API is unreachable.
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
