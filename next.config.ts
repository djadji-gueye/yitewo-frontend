import type { NextConfig } from "next";

const nextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.yitewo.com' }],
        destination: 'https://yitewo.com/:path*',
        permanent: true, // 301 — bon pour le SEO
      },
    ];
  },
};

export default nextConfig;
