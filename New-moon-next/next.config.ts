import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'react-router-dom': path.resolve(__dirname, 'src/shims/react-router-dom.tsx'),
      'react-helmet-async': path.resolve(__dirname, 'src/shims/react-helmet-async.tsx'),
    };
    return config;
  },
};

export default nextConfig;
