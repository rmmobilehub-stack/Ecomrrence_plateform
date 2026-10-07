'use client';

import { customerLoginHref } from '@/lib/customer-login-path';

type CustomerMe = { id: string; storeId: string; name: string; email: string; phone?: string } | null;

let cached: { at: number; customer: CustomerMe } | null = null;

export async function fetchCustomerSession(force = false): Promise<CustomerMe> {
  if (!force && cached && Date.now() - cached.at < 15_000) return cached.customer;
  try {
    const response = await fetch('/api/customer/me', { credentials: 'same-origin' });
    const data = await response.json();
    const customer = (data.customer as CustomerMe) || null;
    cached = { at: Date.now(), customer };
    return customer;
  } catch {
    cached = { at: Date.now(), customer: null };
    return null;
  }
}

export function clearCustomerSessionCache() {
  cached = null;
}

/** If guest, redirect to login and return false. After login, returnTo brings them back. */
export async function ensureCustomerLogin(storeSlug: string, returnPath: string): Promise<boolean> {
  const customer = await fetchCustomerSession();
  if (customer) return true;
  window.location.href = customerLoginHref(storeSlug, returnPath);
  return false;
}
