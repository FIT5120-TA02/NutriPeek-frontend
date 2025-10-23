const withNextIntl = require('next-intl/plugin')(
  // This is the default, also the `src` folder is supported
  './src/libs/i18n.ts'
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {

    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Add cache control with optimized settings for images and static assets
  headers: async () => {
    return [
      {
        // Cache static assets (images, fonts, etc.)
        source: '/public/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache images from CDN
        source: '/_next/image',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        // Only HTML pages have no-store for locale switching
        source: '/:path*.html',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ];
  },


  eslint: {
   ignoreDuringBuilds: true,
  },
};

module.exports = withNextIntl(nextConfig);
