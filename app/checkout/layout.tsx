import type { Metadata } from 'next';
import DefaultStoreShell from '@/components/store/DefaultStoreShell';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Checkout', robots: { index: false, follow: false } };

export default function DefaultCheckoutLayout({ children }: { children: React.ReactNode }) {
  return <DefaultStoreShell>{children}</DefaultStoreShell>;
}
