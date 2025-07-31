import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    // Use our custom ESLint configuration
    ignoreDuringBuilds: false,
  },
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/ai-sdlc-demo' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/ai-sdlc-demo/' : '',
};

export default nextConfig;
