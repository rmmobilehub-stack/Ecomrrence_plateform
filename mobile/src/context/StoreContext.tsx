import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { fetchStore } from '../api';
import { colors } from '../theme';
import type { Store } from '../types';

type StoreContextValue = {
  store: Store | null;
  loading: boolean;
  error: string;
  accent: string;
  currency: string;
  reload: () => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    fetchStore()
      .then(data => setStore(data.store))
      .catch(err => setError(err instanceof Error ? err.message : 'Could not load store'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const value = useMemo(
    () => ({
      store,
      loading,
      error,
      accent: store?.primaryColor || colors.accent,
      currency: store?.currency || 'PKR',
      reload: load,
    }),
    [store, loading, error],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
