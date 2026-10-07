import type { Metadata } from 'next';
import DefaultStoreShell from '@/components/store/DefaultStoreShell';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'My account',
  description: 'Track your orders and repair bookings.',
  robots: { index: false, follow: false },
};

export default function DefaultAccountLayout({ children }: { children: React.ReactNode }) {
  return <DefaultStoreShell>{children}</DefaultStoreShell>;
}
