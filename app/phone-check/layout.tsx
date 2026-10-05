import type { Metadata } from 'next';
import DefaultStoreShell from '@/components/store/DefaultStoreShell';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Phone Check',
  description: 'Check iPhone health score, Pakistan market worth, and get buy or repair suggestions.',
};

export default function DefaultPhoneCheckLayout({ children }: { children: React.ReactNode }) {
  return <DefaultStoreShell>{children}</DefaultStoreShell>;
}
