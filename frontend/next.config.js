/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    // Durante o build, permite algumas regras específicas
    ignoreDuringBuilds: false,
  },
  images: {
    domains: [
      'media.formula1.com',
      'www.formula1.com',
      'cdn.openf1.org',
      'logos-world.net'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  // Enable PWA features
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  // Redirects for better SEO
  async redirects() {
    return [
      {
        source: '/drivers/:path*',
        has: [
          {
            type: 'query',
            key: 'team',
            value: '(?<team>.*)',
          },
        ],
        destination: '/teams/:team/drivers/:path*',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
