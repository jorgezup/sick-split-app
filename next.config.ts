import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

if (process.env.VERCEL) {
  if (!process.env.VERCEL_BUILD_COMMAND) {
    process.env.VERCEL_BUILD_COMMAND = 'prisma generate && next build';
  } else if (!process.env.VERCEL_BUILD_COMMAND.includes('prisma generate')) {
    process.env.VERCEL_BUILD_COMMAND = `prisma generate && ${process.env.VERCEL_BUILD_COMMAND}`;
  }
}

export default nextConfig;
