import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' }
    ]
  },
  // إضافة تجاهل أخطاء التايب سكريبت أثناء الرفع
  typescript: {
    ignoreBuildErrors: true,
  },
  // إضافة تجاهل أخطاء التنسيق (Lint) أثناء الرفع
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
