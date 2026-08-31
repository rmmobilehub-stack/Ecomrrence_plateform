/** @type {import('next').NextConfig} */
const nextConfig = {
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
