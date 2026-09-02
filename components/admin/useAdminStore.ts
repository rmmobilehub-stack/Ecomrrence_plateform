'use client';

import { useEffect, useState } from 'react';

export type AdminStoreSummary = {
  id: string;
  name: string;
  slug: string;
  logo: string;
  currency: string;
  isActive: boolean;
};

export function useAdminStore(): AdminStoreSummary | null {
  const [store, setStore] = useState<AdminStoreSummary | null>(null);
  useEffect(() => {
    fetch('/api/admin/store')
      .then((response) => response.ok ? response.json() : null)
      .then((data) => data?.store && setStore(data.store))
      .catch(() => undefined);
  }, []);
  return store;
}
