import type { NextConfig } from 'next';
import { withGluestackUI } from '@gluestack/ui-next-adapter';

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: [],

  allowedDevOrigins: ['10.132.204.82'],

  experimental: {
    turbopackFileSystemCacheForDev: false,
  },
};

export default withGluestackUI(nextConfig);