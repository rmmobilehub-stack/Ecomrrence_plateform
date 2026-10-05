import type { Metadata } from 'next';
import DefaultStoreShell from '@/components/store/DefaultStoreShell';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'iPhone Repair Doorstep',
  description: 'Book iPhone doorstep repair — we come to you, fix it, and leave.',
};

export default function DefaultRepairLayout({ children }: { children: React.ReactNode }) {
  return <DefaultStoreShell>{children}</DefaultStoreShell>;
}
