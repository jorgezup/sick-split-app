/* eslint-disable @typescript-eslint/no-require-imports */
// import withPWA from 'next-pwa';

const withPWA = require('next-pwa')({
  dest: 'public', // Output directory for service worker
  register: true, // Automatically register service worker
  skipWaiting: true, // Activate service worker immediately
  scope: '/app',
  sw: 'service-worker.js',
  disable: process.env.NODE_ENV === 'development', // Disable in development mode
});

if (process.env.VERCEL) {
  if (!process.env.VERCEL_BUILD_COMMAND) {
    process.env.VERCEL_BUILD_COMMAND = 'prisma generate && next build';
  } else if (!process.env.VERCEL_BUILD_COMMAND.includes('prisma generate')) {
    process.env.VERCEL_BUILD_COMMAND = `prisma generate && ${process.env.VERCEL_BUILD_COMMAND}`;
  }
}

module.exports = withPWA({
  reactStrictMode: true,
}); 

// export default nextConfig;
