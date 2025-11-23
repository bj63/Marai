/** @type {import('next').NextConfig} */
// Required for the Docker image to bundle a self-contained server build
const nextConfig = {
  output: 'standalone',
  experimental: {
    typedRoutes: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: `${process.env.NEXT_PUBLIC_MOA_API_URL || 'https://moaaiv3-production.up.railway.app'}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
