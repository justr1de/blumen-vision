/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    serverComponentsExternalPackages: ['xlsx'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  // Disable static page generation for pages that use client-side hooks
  // This is needed because ThemeProvider (next-themes) uses useContext
  // which fails during static prerendering
  typescript: {
    ignoreBuildErrors: false,
  },
};
module.exports = nextConfig;
