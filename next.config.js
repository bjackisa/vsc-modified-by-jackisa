/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: ['bcryptjs'],
  // Ensure environment variables are available during build
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
};

module.exports = nextConfig;
