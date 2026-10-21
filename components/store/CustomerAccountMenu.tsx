'use client';

import Link from 'next/link';
import { LogIn, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { storefrontPath } from '@/lib/storefront-paths';
import { fetchCustomerSession } from '@/components/store/ensureCustomerLogin';

export type CustomerBrief = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  storeId?: string;
};

export default function CustomerAccountMenu({
  slug,
  storeId,
  initialCustomer = null,
}: {
  slug: string;
  storeId?: string;
  initialCustomer?: CustomerBrief | null;
}) {
  const [customer, setCustomer] = useState<CustomerBrief | null>(initialCustomer);
  const [loaded, setLoaded] = useState(Boolean(initialCustomer));
  const loginHref = storefrontPath(slug, 'account/login');
  const accountHref = storefrontPath(slug, 'account');

  useEffect(() => {
    let alive = true;

    const sync = (force = false) => {
      void fetchCustomerSession(force)
        .then((session) => {
          if (!alive) return;
          if (session && storeId && session.storeId && session.storeId !== storeId) {
            setCustomer(null);
            return;
          }
          setCustomer(
            session
              ? {
                  id: session.id,
                  name: session.name,
                  email: session.email,
                  storeId: session.storeId,
                }
              : null,
          );
        })
        .catch(() => {
          if (alive) setCustomer(null);
        })
        .finally(() => {
          if (alive) setLoaded(true);
        });
    };

    sync(Boolean(initialCustomer));

    const onFocus = () => sync(true);
    window.addEventListener('focus', onFocus);
    return () => {
      alive = false;
      window.removeEventListener('focus', onFocus);
    };
  }, [storeId, initialCustomer]);

  if (!loaded) {
    return <span className="store-account-btn is-loading" aria-hidden />;
  }

  if (customer) {
    return (
      <Link className="store-account-btn is-user" href={accountHref} title="My orders & repairs">
        {customer.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={customer.avatarUrl} alt="" />
        ) : (
          <UserRound size={18} />
        )}
        <span className="store-account-label">{customer.name?.split(' ')[0] || 'Account'}</span>
      </Link>
    );
  }

  return (
    <Link className="store-account-btn" href={loginHref} title="Login to track orders">
      <LogIn size={17} />
      <span className="store-account-label">Login</span>
    </Link>
  );
}
