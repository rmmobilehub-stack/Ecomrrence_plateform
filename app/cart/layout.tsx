import type { Metadata } from 'next';
import DefaultStoreShell from '@/components/store/DefaultStoreShell';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Shopping cart', robots: { index: false, follow: false } };

export default function DefaultCartLayout({ children }: { children: React.ReactNode }) {
  return <DefaultStoreShell>{children}</DefaultStoreShell>;
}
