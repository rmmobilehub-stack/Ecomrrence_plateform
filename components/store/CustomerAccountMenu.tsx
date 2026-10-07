'use client';

import Link from 'next/link';
import { LogIn, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { storefrontPath } from '@/lib/storefront-paths';

type CustomerBrief = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
};

export default function CustomerAccountMenu({ slug }: { slug: string }) {
  const [customer, setCustomer] = useState<CustomerBrief | null>(null);
  const [loaded, setLoaded] = useState(false);
  const loginHref = storefrontPath(slug, 'account/login');
  const accountHref = storefrontPath(slug, 'account');

  useEffect(() => {
    let alive = true;
    fetch('/api/customer/me')
      .then((res) => res.json())
      .then((data) => {
        if (!alive) return;
        setCustomer(data.customer ?? null);
      })
      .catch(() => {
        if (alive) setCustomer(null);
      })
      .finally(() => {
        if (alive) setLoaded(true);
      });
    return () => {
      alive = false;
    };
  }, []);

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
