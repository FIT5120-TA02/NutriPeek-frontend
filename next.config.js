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
  // Add cache control for better handling of locale switching
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ];
  },
<<<<<<< HEAD
  eslint: {
   ignoreDuringBuilds: true,
  },
};

module.exports = withNextIntl(nextConfig);
=======
};

module.exports = withNextIntl(nextConfig);
>>>>>>> 6d97d02bb0e3e6d7b6542f3a5b20492d23cc701f
