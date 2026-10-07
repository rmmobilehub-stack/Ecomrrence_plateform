import { notFound, redirect } from 'next/navigation';
import { getCustomerSession } from '@/lib/customer-auth';
import { getActiveStoreBySlug } from '@/lib/db';
import { customerLoginHref } from '@/lib/customer-login-path';

/** Redirect guests to login, then back to `returnPath` after they sign in. */
export async function requireStorefrontCustomer(storeSlug: string, returnPath: string) {
  const store = await getActiveStoreBySlug(storeSlug);
  if (!store) notFound();

  const session = await getCustomerSession();
  if (!session || session.storeId !== store.id) {
    redirect(customerLoginHref(store.slug, returnPath));
  }

  return { store, session };
}
