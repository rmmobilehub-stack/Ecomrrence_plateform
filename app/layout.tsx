import type { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: { default: 'Ecommerce SaaS Platform', template: '%s | Ecommerce SaaS Platform' },
  description: 'Discover products from independent stores and order online with cash on delivery.',
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
