import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    // Use our custom ESLint configuration
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
