/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async rewrites() {
    return [
      // 0. Local media/uploads redirect to NestJS backend
      {
        source: '/uploads/:path*',
        destination: 'http://localhost:3001/uploads/:path*',
      },
      {
        source: '/images/:path*',
        destination: 'http://localhost:3001/images/:path*',
      },
      // 1. Auth routes go to production C# backend (both casings)
      {
        source: '/api/Auth/:path*',
        destination: 'http://e7nama3ak.runasp.net/api/Auth/:path*',
      },
      {
        source: '/api/auth/:path*',
        destination: 'http://e7nama3ak.runasp.net/api/Auth/:path*',
      },
      // 2. Capitalized Resources and Podcasts routes mapped to lowercase NestJS routes
      {
        source: '/api/Resources/:path*',
        destination: 'http://localhost:3001/api/v1/resources/:path*',
      },
      {
        source: '/api/Resources',
        destination: 'http://localhost:3001/api/v1/resources',
      },
      {
        source: '/api/Podcasts/:path*',
        destination: 'http://localhost:3001/api/v1/podcasts/:path*',
      },
      {
        source: '/api/Podcasts',
        destination: 'http://localhost:3001/api/v1/podcasts',
      },
      // 3. All other API calls fall through to local NestJS backend
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/v1/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
