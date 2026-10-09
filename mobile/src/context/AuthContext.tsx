import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { setAuthToken } from '../session';
import type { CustomerProfile } from '../types';

const TOKEN_KEY = 'shopsaas-customer-token';
const PROFILE_KEY = 'shopsaas-customer-profile';
const LOCAL_TOKEN = 'local-dev-session';

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

function localProfile(partial: Partial<CustomerProfile>): CustomerProfile {
  return {
    id: partial.id || 'local-guest',
    name: partial.name || 'Guest',
    email: partial.email || '',
    phone: partial.phone || '',
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(PROFILE_KEY)
      .then(raw => {
        if (!raw) return;
        const profile = JSON.parse(raw) as CustomerProfile;
        setAuthToken(LOCAL_TOKEN);
        setCustomer(profile);
      })
      .catch(() => {
        setAuthToken(null);
        setCustomer(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const persist = async (profile: CustomerProfile) => {
    setAuthToken(LOCAL_TOKEN);
    await AsyncStorage.setItem(TOKEN_KEY, LOCAL_TOKEN);
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    setCustomer(profile);
  };

  const value = useMemo(
    () => ({
      customer,
      loading,
      login: async (email: string) => {
        await persist(localProfile({ email, name: email.split('@')[0] || 'Guest' }));
      },
      register: async payload => {
        await persist(
          localProfile({
            name: payload.name || payload.email.split('@')[0] || 'Guest',
            email: payload.email,
            phone: payload.phone,
          }),
        );
      },
      logout: async () => {
        setAuthToken(null);
        setCustomer(null);
        await AsyncStorage.multiRemove([TOKEN_KEY, PROFILE_KEY]);
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
