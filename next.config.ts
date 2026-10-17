import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  compress: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  cacheComponents: true,
  partialPrefetching: true,
  async redirects() {
    return [
      {
        source: '/register',
        destination: '/join',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
