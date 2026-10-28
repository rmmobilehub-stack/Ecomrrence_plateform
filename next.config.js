/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [{
      source: '/downloads/RMMobile-latest.apk',
      headers: [
        { key: 'Content-Type', value: 'application/vnd.android.package-archive' },
        { key: 'Content-Disposition', value: 'attachment; filename="RMMobile-latest.apk"' },
        { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
      ],
    }];
  },
  async redirects() {
    const defaultStoreSlug = process.env.NEXT_PUBLIC_DEFAULT_STORE_SLUG || process.env.DEFAULT_STORE_SLUG || 'demo';
    return [
      { source: `/store/${defaultStoreSlug}`, destination: '/', permanent: true },
      { source: `/store/${defaultStoreSlug}/:path*`, destination: '/:path*', permanent: true },
    ];
  },
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['bcryptjs'],
  },
};

module.exports = nextConfig;
