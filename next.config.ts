import withPWA from 'next-pwa';

const nextConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

if (process.env.VERCEL) {
  if (!process.env.VERCEL_BUILD_COMMAND) {
    process.env.VERCEL_BUILD_COMMAND = 'prisma generate && next build';
  } else if (!process.env.VERCEL_BUILD_COMMAND.includes('prisma generate')) {
    process.env.VERCEL_BUILD_COMMAND = `prisma generate && ${process.env.VERCEL_BUILD_COMMAND}`;
  }
}

export default nextConfig;
