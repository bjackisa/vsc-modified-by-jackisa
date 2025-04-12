/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['bcryptjs']
  },
  // Ensure environment variables are available during build
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
  // Increase serverless function timeout
  serverRuntimeConfig: {
    maxDuration: 60, // 60 seconds
  },
};

module.exports = nextConfig;
