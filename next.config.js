/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: true,
    serverComponentsExternalPackages: ["mongoose"],
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      'msklbucket.s3.eu-west-3.amazonaws.com',
      'utfs.io',
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "images.clerk.dev",
      },
      {
        protocol: "https",
        hostname: "uploadthing.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/beds24/:path*',
        destination: 'https://api.beds24.com/v2/:path*',
      },
      // Ajouter d'autres proxys si nécessaire
    ];
  },
};

module.exports = nextConfig;

