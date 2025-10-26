const withNextIntl = require('next-intl/plugin')(
  // This is the default, also the `src` folder is supported
  './src/libs/i18n.ts'
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Add cache control for better handling of locale switching
  headers: async () => {
    return [
      {
        // Only apply no-cache to HTML pages, not static assets
        source: '/:locale(en|zh)/:path*',
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
